import { banner } from './index';

export function mount() {
  const root = document.getElementById('root');
  if (root) {
    const el = document.createElement('pre');
    el.textContent = `${banner()}\n- Data Sources: mock\n- Status: alpha`;
    root.appendChild(el);
  }
}

if (typeof document !== 'undefined') {
  mount();
}
