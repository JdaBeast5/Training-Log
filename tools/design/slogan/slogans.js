// The three slogans the mock-ups compare (planning/slogan.md §3). ?s=1|2|3 picks one; the Sash tile is the v3.516 mark.
window.SLOGANS = ['Earn the next plate.', 'A plan for every lifter.', 'Load the bar. Log the set.'];
window.SLOGAN = window.SLOGANS[(Number(new URLSearchParams(location.search).get('s')) || 1) - 1];
window.SASH = '<svg class="sash" viewBox="0 0 24 24" aria-hidden="true"><defs><clipPath id="st"><rect width="24" height="24" rx="5.4"/></clipPath></defs>'
  + '<g clip-path="url(#st)"><rect width="24" height="24" fill="#0C0C0D"/><g transform="rotate(-30 12 12)">'
  + '<rect x="-10" y="6" width="44" height="2.1" fill="#D42F25"/><rect x="-10" y="8.5" width="44" height="2.1" fill="#2C5BD8"/>'
  + '<rect x="-10" y="11" width="44" height="2.1" fill="#F2C200"/><rect x="-10" y="13.5" width="44" height="2.1" fill="#1E9E4A"/>'
  + '<rect x="-10" y="16" width="44" height="2.1" fill="#E6E6E2"/></g></g></svg>';
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-slogan]').forEach(el => { el.textContent = window.SLOGAN; });
  document.querySelectorAll('[data-sash]').forEach(el => { el.innerHTML = window.SASH; });
});
