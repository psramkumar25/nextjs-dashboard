import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | Invoice',
    default: 'Invoices',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
