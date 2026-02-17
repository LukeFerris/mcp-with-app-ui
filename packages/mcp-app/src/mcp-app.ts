import { App } from '@modelcontextprotocol/ext-apps';

const helloBtn = document.getElementById('hello-btn') as HTMLButtonElement;
const helloResult = document.getElementById('hello-result')!;
const addressesBtn = document.getElementById('addresses-btn') as HTMLButtonElement;
const addressesResult = document.getElementById('addresses-result')!;

const app = new App({ name: 'MCP App UI', version: '1.0.0' });

interface Address {
  id: number;
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
}

function renderHelloResult(text: string): void {
  helloResult.style.display = 'block';
  helloResult.textContent = text;
}

function renderAddressTable(addresses: Address[]): void {
  addressesResult.style.display = 'block';
  const headers = ['ID', 'Name', 'Street', 'City', 'State', 'Zip'];
  const rows = addresses
    .map(
      (a) =>
        `<tr><td>${a.id}</td><td>${a.name}</td><td>${a.street}</td><td>${a.city}</td><td>${a.state}</td><td>${a.zip}</td></tr>`,
    )
    .join('');
  addressesResult.innerHTML = `<table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table>`;
}

app.ontoolresult = (result) => {
  const text = result.content?.find((c: { type: string }) => c.type === 'text')?.text ?? '';
  try {
    const parsed = JSON.parse(text) as { addresses?: Address[] };
    if (parsed.addresses) {
      renderAddressTable(parsed.addresses);
      return;
    }
  } catch {
    /* not JSON, treat as hello result */
  }
  renderHelloResult(text);
};

helloBtn.addEventListener('click', async () => {
  helloBtn.disabled = true;
  try {
    const result = await app.callServerTool({ name: 'hello_world', arguments: {} });
    const text = result.content?.find((c: { type: string }) => c.type === 'text')?.text ?? '[ERROR]';
    renderHelloResult(text);
  } finally {
    helloBtn.disabled = false;
  }
});

addressesBtn.addEventListener('click', async () => {
  addressesBtn.disabled = true;
  try {
    const result = await app.callServerTool({ name: 'get_addresses', arguments: {} });
    const text = result.content?.find((c: { type: string }) => c.type === 'text')?.text ?? '[]';
    try {
      const parsed = JSON.parse(text) as { addresses?: Address[] };
      if (parsed.addresses) {
        renderAddressTable(parsed.addresses);
      }
    } catch {
      renderHelloResult(text);
    }
  } finally {
    addressesBtn.disabled = false;
  }
});

app.connect();
