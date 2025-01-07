CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,  -- Auto-incrementing user ID
    name VARCHAR(100) NOT NULL,  -- User's full name
    email VARCHAR(255) UNIQUE NOT NULL,  -- User's email (unique)
    username VARCHAR(100) UNIQUE NOT NULL,  -- User's username (unique)
    password VARCHAR(255) NOT NULL  -- User's password (hashed)
);

CREATE TABLE groups (
    group_id BIGINT PRIMARY KEY,  -- Group ID (assuming BIGINT is enough)
    name VARCHAR(100) NOT NULL,  -- Group's name
    created_by VARCHAR(255) NOT NULL,  -- Email of the user who created the group
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Creation timestamp
);

CREATE TABLE user_groups (
    user_id INT NOT NULL,  -- User ID (foreign key to users)
    group_id BIGINT NOT NULL,  -- Group ID (foreign key to groups)
    PRIMARY KEY (user_id, group_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (group_id) REFERENCES groups(group_id)
);
CREATE TABLE debts (
    debt_id UUID PRIMARY KEY,  -- Unique debt ID (UUID)
    transaction_id UUID NOT NULL,  -- Transaction ID (linked to transactions)
    group_id BIGINT NOT NULL,  -- Group ID (foreign key to groups table)
    amount DECIMAL(10, 2) NOT NULL,  -- Debt amount
    reason TEXT,  -- Reason for the debt
    payer VARCHAR(255) NOT NULL,  -- Email of the person who paid
    debtor VARCHAR(255) NOT NULL,  -- Email of the person who owes money
    status VARCHAR(50) DEFAULT 'unsettled',  -- Status of the debt (unsettled or settled)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Timestamp when the debt was created
    FOREIGN KEY (group_id) REFERENCES groups(group_id)
);
CREATE TABLE transactions (
    transaction_id UUID PRIMARY KEY,  -- Unique transaction ID (UUID)
    group_id BIGINT NOT NULL,  -- Group ID (foreign key to groups)
    payer VARCHAR(255) NOT NULL,  -- Email of the payer
    amount DECIMAL(10, 2) NOT NULL,  -- Transaction amount
    reason TEXT,  -- Description of the transaction
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Timestamp of the transaction
    FOREIGN KEY (group_id) REFERENCES groups(group_id)
);
CREATE TABLE spending (
    group_id BIGINT NOT NULL,  -- Group ID (foreign key to groups)
    transaction_id UUID NOT NULL,  -- Transaction ID (foreign key to transactions)
    payer VARCHAR(255) NOT NULL,  -- Email of the payer
    sponsored VARCHAR(255) NOT NULL,  -- Email of the person who sponsored
    amount DECIMAL(10, 2) NOT NULL,  -- Sponsored amount
    reason TEXT,  -- Reason for the spending
    PRIMARY KEY (group_id, transaction_id, sponsored),
    FOREIGN KEY (group_id) REFERENCES groups(group_id),
    FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id)
);
CREATE TABLE sponsor (
    id UUID PRIMARY KEY,  -- Unique sponsor ID (UUID)
    group_id BIGINT NOT NULL,  -- Group ID (foreign key to groups)
    amount DECIMAL(10, 2) NOT NULL,  -- Sponsored amount
    reason TEXT,  -- Reason for sponsoring
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Date of sponsorship
    user_email VARCHAR(255) NOT NULL,  -- Email of the user who sponsored
    FOREIGN KEY (group_id) REFERENCES groups(group_id)
);
