/**
 * Response from the hello_world tool.
 */
export interface HelloWorldResponse {
  message: string;
  timestamp: string;
}

/**
 * A physical address entry.
 */
export interface Address {
  id: number;
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
}

const ADDRESSES: Address[] = [
  { id: 1, name: 'Alice Johnson', street: '742 Evergreen Terrace', city: 'Springfield', state: 'IL', zip: '62704' },
  { id: 2, name: 'Bob Martinez', street: '221B Baker Street', city: 'Portland', state: 'OR', zip: '97201' },
  { id: 3, name: 'Carol Chen', street: '1600 Pennsylvania Ave', city: 'Austin', state: 'TX', zip: '78701' },
  { id: 4, name: 'David Kim', street: '350 Fifth Avenue', city: 'New York', state: 'NY', zip: '10118' },
  { id: 5, name: 'Eva Rossi', street: '1 Infinite Loop', city: 'Denver', state: 'CO', zip: '80202' },
];

/**
 * Returns a hello world greeting with the current timestamp.
 * @returns Hello world response
 */
export function getHelloWorldResponse(): HelloWorldResponse {
  return {
    message: 'Hello from MCP Server!',
    timestamp: new Date().toISOString(),
  };
}

/**
 * Returns a list of fictitious addresses.
 * @returns Array of address entries
 */
export function getAddresses(): Address[] {
  return ADDRESSES;
}
