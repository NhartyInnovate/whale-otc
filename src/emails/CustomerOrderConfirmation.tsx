import { Html, Head, Body, Container, Section, Text, Heading, Hr, Row, Column } from '@react-email/components';
import { OrderPayload } from '../lib/notifications/types';
import * as React from 'react';

export default function CustomerOrderConfirmation({ order }: { order: OrderPayload }) {
  const formatMoney = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: currency === 'NGN' ? 'NGN' : 'USD' }).format(amount).replace('$', currency === 'NGN' ? '₦' : '$');
  };

  const isBuy = order.side.toUpperCase() === 'BUY';
  const cryptoAmount = isBuy ? order.output_amount : order.input_amount;
  const ngnAmount = isBuy ? order.input_amount : order.output_amount;

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Text style={brandText}>WHALE</Text>
            <Text style={receiptTitle}>ORDER RECEIVED</Text>
          </Section>

          <Hr style={divider} />

          <Section style={contentSection}>
            <Text style={greeting}>Hi {order.customer_name},</Text>
            <Text style={description}>
              We have received your order. We will process your request and contact you to complete the transaction.
            </Text>
          </Section>

          <Section style={boxSection}>
            <Row>
              <Column>
                <Text style={label}>ORDER REFERENCE</Text>
                <Text style={value}>{order.order_reference}</Text>
              </Column>
              <Column align="right">
                <Text style={label}>DATE</Text>
                <Text style={value}>{new Date(order.created_at).toLocaleDateString('en-GB')}</Text>
              </Column>
            </Row>
            <Hr style={subDivider} />
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
          </Section>

          <Section style={highlightSection}>
            <Text style={label}>CRYPTO AMOUNT</Text>
            <Text style={hugeValue}>{cryptoAmount} <span style={assetText}>{order.asset}</span></Text>
            
            <Hr style={subDivider} />
            
            <Text style={label}>{isBuy ? 'YOU PAY' : 'YOU RECEIVE'}</Text>
            <Text style={hugeValue}>{formatMoney(ngnAmount, 'NGN')}</Text>
          </Section>

          <Section style={contentSection}>
            <Row>
              <Column>
                <Text style={label}>RATE</Text>
                <Text style={value}>{formatMoney(order.customer_rate, 'NGN')} / {order.asset}</Text>
              </Column>
              <Column align="right">
                <Text style={label}>STATUS</Text>
                <Text style={statusBadge}>PENDING</Text>
              </Column>
            </Row>
          </Section>

          <Hr style={divider} />

          <Section style={footerSection}>
            <Text style={footerText}>Thank you for using Whale.</Text>
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
};

const greeting = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#000000',
  margin: '0 0 8px',
};

const description = {
  fontSize: '14px',
  lineHeight: '22px',
  color: '#666666',
  margin: '0',
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
  fontSize: '28px',
  fontWeight: '700',
  color: '#000000',
  margin: '0',
  letterSpacing: '-0.5px',
};

const assetText = {
  fontSize: '16px',
  color: '#666666',
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
  padding: '24px 40px 40px',
  textAlign: 'center' as const,
};

const footerText = {
  fontSize: '12px',
  color: '#999999',
  margin: '0',
};
