import { render, screen } from '@testing-library/react';
import App from './App';

test('renders ECHO heading', () => {
  render(<App />);
  const heading = screen.getByText(/Reimagining/i);
  expect(heading).toBeInTheDocument();
});
