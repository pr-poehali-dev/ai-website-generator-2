CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    plan_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    tokens_balance INTEGER DEFAULT 0,
    tokens_used INTEGER DEFAULT 0,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    subscription_id INTEGER,
    payment_type VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'RUB',
    status VARCHAR(50) DEFAULT 'pending',
    robokassa_invoice_id VARCHAR(255),
    robokassa_signature VARCHAR(255),
    tokens_amount INTEGER DEFAULT 0,
    metadata TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_robokassa_invoice ON payments(robokassa_invoice_id);

COMMENT ON TABLE subscriptions IS 'User subscriptions: Light (999₽/month), Pro (1999₽/month)';
COMMENT ON TABLE payments IS 'Payment transactions via Robokassa';
COMMENT ON COLUMN subscriptions.plan_type IS 'Subscription plan: light, pro, or tokens';
COMMENT ON COLUMN subscriptions.tokens_balance IS 'Remaining tokens for this subscription';
COMMENT ON COLUMN payments.payment_type IS 'Payment type: subscription_light, subscription_pro, tokens';
