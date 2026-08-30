import { Html, Head, Body, Container, Section, Text, Hr, Row, Column, Link } from '@react-email/components';
import { OrderPayload } from '../lib/notifications/types';
import * as React from 'react';

export default function OperatorNewOrder({ order }: { order: OrderPayload }) {
  const isBuy = order.side.toUpperCase() === 'BUY';
  const formatMoney = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: currency === 'NGN' ? 'NGN' : 'USD' }).format(amount).replace('$', currency === 'NGN' ? '₦' : '$');
  };

  const cryptoAmount = isBuy ? order.output_amount : order.input_amount;
  const ngnAmount = isBuy ? order.input_amount : order.output_amount;

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Text style={brandText}>WHALE</Text>
            <Text style={receiptTitle}>NEW ORDER TICKT</Text>
          </Section>

          <Hr style={divider} />

          <Section style={highlightSection}>
            <Text style={label}>ORDER REFERENCE</Text>
            <Text style={hugeValue}>{order.order_reference}</Text>
          </Section>

          <Section style={boxSection}>
            <Row>
              <Column>
                <Text style={label}>TYPE</Text>
                <Text style={value}>{order.side.toUpperCase()}</Text>
              </Column>
              <Column align="right">
                <Text style={label}>ASSET</Text>
                <Text style={value}>{order.asset}</Text>
              </Column>
            </Row>
            <Hr style={subDivider} />
            <Row>
              <Column>
                <Text style={label}>CRYPTO</Text>
                <Text style={value}>{cryptoAmount} {order.asset}</Text>
              </Column>
              <Column align="right">
                <Text style={label}>CUSTOMER NGN</Text>
                <Text style={value}>{formatMoney(ngnAmount, 'NGN')}</Text>
              </Column>
            </Row>
            <Hr style={subDivider} />
            <Row>
              <Column>
                <Text style={label}>RATE</Text>
                <Text style={value}>{formatMoney(order.customer_rate, 'NGN')} / {order.asset}</Text>
              </Column>
              <Column align="right">
                <Text style={label}>STATUS</Text>
                <Text style={statusBadge}>{order.status}</Text>
              </Column>
            </Row>
          </Section>

          <Section style={contentSection}>
            <Text style={sectionTitle}>CUSTOMER DETAILS</Text>
            <Text style={text}>{order.customer_name}</Text>
            <Text style={text}>{order.customer_phone}</Text>
            {order.customer_email && <Text style={text}>{order.customer_email}</Text>}
          </Section>

          <Hr style={divider} />

          <Section style={contentSection}>
            <Text style={sectionTitle}>OPERATIONAL DELIVERY</Text>
            {isBuy ? (
              <>
                <Text style={label}>WALLET ADDRESS</Text>
                <Text style={codeText}>{order.wallet_address}</Text>
                <Text style={label}>NETWORK</Text>
                <Text style={text}>{order.wallet_network}</Text>
              </>
            ) : (
              <>
                <Text style={label}>BANK NAME</Text>
                <Text style={text}>{order.bank_name}</Text>
                <Text style={label}>ACCOUNT NUMBER</Text>
                <Text style={codeText}>{order.bank_account_number}</Text>
                <Text style={label}>ACCOUNT NAME</Text>
                <Text style={text}>{order.bank_account_name}</Text>
              </>
            )}
          </Section>
          
          <Hr style={divider} />

          <Section style={footerSection}>
            <Link href="http://localhost:3000/admin" style={button}>Open Command Center</Link>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f5f5f5',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  padding: '40px 0',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  border: '1px solid #e5e5e5',
  borderRadius: '8px',
  overflow: 'hidden',
  maxWidth: '500px',
};

const headerSection = {
  padding: '40px 40px 20px',
  textAlign: 'center' as const,
};

const brandText = {
  fontSize: '24px',
  fontWeight: '800',
  letterSpacing: '2px',
  margin: '0 0 10px',
  color: '#000000',
};

const receiptTitle = {
  fontSize: '12px',
  fontWeight: '600',
  letterSpacing: '1px',
  color: '#666666',
  margin: '0',
};

const divider = {
  borderTop: '1px solid #e5e5e5',
  margin: '0',
};

const subDivider = {
  borderTop: '1px dashed #e5e5e5',
  margin: '16px 0',
};

const contentSection = {
  padding: '24px 40px',
};

const boxSection = {
  padding: '24px 40px',
  backgroundColor: '#fafafa',
  borderTop: '1px solid #e5e5e5',
  borderBottom: '1px solid #e5e5e5',
};

const highlightSection = {
  padding: '32px 40px',
  textAlign: 'center' as const,
};

const sectionTitle = {
  fontSize: '12px',
  fontWeight: '700',
  letterSpacing: '1px',
  color: '#000000',
  margin: '0 0 16px',
};

const label = {
  fontSize: '10px',
  fontWeight: '700',
  color: '#888888',
  letterSpacing: '1px',
  margin: '0 0 4px',
};

const value = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#000000',
  margin: '0',
};

const hugeValue = {
  fontSize: '24px',
  fontWeight: '700',
  color: '#000000',
  margin: '0',
  letterSpacing: '-0.5px',
};

const text = {
  fontSize: '14px',
  color: '#333333',
  margin: '0 0 8px',
};

const codeText = {
  fontSize: '14px',
  color: '#000000',
  fontFamily: 'monospace',
  backgroundColor: '#f5f5f5',
  padding: '4px 8px',
  borderRadius: '4px',
  display: 'inline-block',
  margin: '0 0 16px',
};

const statusBadge = {
  fontSize: '11px',
  fontWeight: '700',
  color: '#000000',
  backgroundColor: '#f0f0f0',
  padding: '4px 8px',
  borderRadius: '4px',
  display: 'inline-block',
  margin: '0',
};

const footerSection = {
  padding: '32px 40px 40px',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#000000',
  color: '#ffffff',
  padding: '16px 24px',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
  display: 'inline-block',
};
