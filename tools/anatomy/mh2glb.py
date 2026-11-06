# MakeHuman (CC0) base mesh + targets + default rig + weights -> rigged .glb
import json, struct, sys, os
import numpy as np

MH = os.environ.get('MH_DATA', os.path.join(os.path.dirname(__file__), 'mh', 'makehuman', 'data'))
TG = os.environ.get('MH_TARGETS', os.path.join(os.path.dirname(__file__), 'targets'))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), 'human.glb')
TARGETS = [('universal-male-young-maxmuscle-averageweight', 0.7), ('universal-male-young-maxmuscle-minweight', 0.3), ('caucasian-male-young', 1.0)]

verts, faces = [], []
group = None
for line in open(os.path.join(MH, '3dobjs', 'base.obj')):
    if line.startswith('v '):
        verts.append([float(x) for x in line.split()[1:4]])
    elif line.startswith('g '):
        group = line.split()[1]
    elif line.startswith('f ') and group == 'body':
        faces.append([int(t.split('/')[0]) - 1 for t in line.split()[1:]])
V = np.array(verts, dtype=np.float64)
for name, w in TARGETS:
    for line in open(os.path.join(TG, name + '.target')):
        if line.startswith('#') or not line.strip(): continue
        p = line.split()
        V[int(p[0])] += w * np.array([float(p[1]), float(p[2]), float(p[3])])

skel = json.load(open(os.path.join(MH, 'rigs', 'default.mhskel')))
J = {k: V[v].mean(axis=0) for k, v in skel['joints'].items()}
bones = skel['bones']
order = []
def visit(n):
    order.append(n)
    for k, b in bones.items():
        if b['parent'] == n: visit(k)
for k, b in bones.items():
    if b['parent'] is None: visit(k)
bidx = {n: i for i, n in enumerate(order)}
head = {n: J[bones[n]['head']] for n in order}
tail = {n: J[bones[n]['tail']] for n in order}

# Only the vertices the body uses, reindexed.
used = sorted({i for f in faces for i in f})
remap = {o: n for n, o in enumerate(used)}
P = V[used] * 0.1  # decimetres -> metres
tris = []
for f in faces:
    g = [remap[i] for i in f]
    tris += [[g[0], g[1], g[2]]] + ([[g[0], g[2], g[3]]] if len(g) == 4 else [])
T = np.array(tris, dtype=np.uint32)
N = np.zeros_like(P)
fn = np.cross(P[T[:, 1]] - P[T[:, 0]], P[T[:, 2]] - P[T[:, 0]])
for k in range(3): np.add.at(N, T[:, k], fn)
N /= np.linalg.norm(N, axis=1, keepdims=True) + 1e-12

wts = json.load(open(os.path.join(MH, 'rigs', 'default_weights.mhw')))['weights']
inf = [[] for _ in used]
for bname, pairs in wts.items():
    if bname not in bidx: continue
    for vi, w in pairs:
        if vi in remap: inf[remap[vi]].append((w, bidx[bname]))
JO = np.zeros((len(used), 4), dtype=np.uint16); WE = np.zeros((len(used), 4), dtype=np.float32)
for i, l in enumerate(inf):
    l = sorted(l, reverse=True)[:4]
    if not l: l = [(1.0, bidx['root'])]
    s = sum(w for w, _ in l)
    for k, (w, b) in enumerate(l): JO[i, k] = b; WE[i, k] = w / s

# glTF: one node per bone, rest pose = translations only (identity rotations).
nodes, joints = [], []
for n in order:
    par = bones[n]['parent']
    t = (head[n] - (head[par] if par else 0)) * 0.1
    nodes.append({'name': n, 'translation': [float(x) for x in t]})
for n in order:
    ch = [bidx[k] for k, b in bones.items() if b['parent'] == n]
    if ch: nodes[bidx[n]]['children'] = ch
IBM = np.zeros((len(order), 16), dtype=np.float32)
for n in order:
    m = np.eye(4, dtype=np.float32); m[:3, 3] = -head[n] * 0.1
    IBM[bidx[n]] = m.T.reshape(-1)  # column-major
mesh_node = len(nodes)
nodes.append({'name': 'body', 'mesh': 0, 'skin': 0})

blobs, views, accs = [], [], []
def add(arr, target, comp, typ, minmax=False):
    b = arr.tobytes(); off = sum(len(x) for x in blobs)
    pad = (-len(b)) % 4; blobs.append(b + b'\0' * pad)
    v = {'buffer': 0, 'byteOffset': off, 'byteLength': len(b)}
    if target: v['target'] = target
    views.append(v)
    a = {'bufferView': len(views) - 1, 'componentType': comp, 'count': len(arr), 'type': typ}
    if minmax: a['min'] = [float(x) for x in arr.min(0)]; a['max'] = [float(x) for x in arr.max(0)]
    accs.append(a); return len(accs) - 1
aP = add(P.astype(np.float32), 34962, 5126, 'VEC3', True)
aN = add(N.astype(np.float32), 34962, 5126, 'VEC3')
aJ = add(JO, 34962, 5123, 'VEC4')
aW = add(WE, 34962, 5126, 'VEC4')
aI = add(T.reshape(-1), 34963, 5125, 'SCALAR')
aB = add(IBM, None, 5126, 'MAT4')
gltf = {
  'asset': {'version': '2.0', 'generator': 'mh2glb (MakeHuman CC0 assets)', 'copyright': 'CC0: MakeHuman base mesh, default rig and weights'},
  'scene': 0, 'scenes': [{'nodes': [bidx['root'], mesh_node]}],
  'nodes': nodes,
  'meshes': [{'primitives': [{'attributes': {'POSITION': aP, 'NORMAL': aN, 'JOINTS_0': aJ, 'WEIGHTS_0': aW}, 'indices': aI}]}],
  'skins': [{'joints': list(range(len(order))), 'inverseBindMatrices': aB, 'skeleton': bidx['root']}],
  'buffers': [{'byteLength': sum(len(x) for x in blobs)}], 'bufferViews': views, 'accessors': accs,
}
js = json.dumps(gltf, separators=(',', ':')).encode(); js += b' ' * ((-len(js)) % 4)
bin_ = b''.join(blobs)
with open(OUT, 'wb') as f:
    f.write(struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(bin_)))
    f.write(struct.pack('<II', len(js), 0x4E4F534A)); f.write(js)
    f.write(struct.pack('<II', len(bin_), 0x004E4942)); f.write(bin_)
print('verts', len(used), 'tris', len(T), 'bones', len(order), 'height m', round(float(P[:, 1].max() - P[:, 1].min()), 3), 'bytes', os.path.getsize(OUT))
