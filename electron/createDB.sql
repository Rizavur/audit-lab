CREATE TABLE currencies (
    currency_code        STRING PRIMARY KEY,
    currency_description STRING
);

CREATE TABLE customers (
    cust_code            STRING PRIMARY KEY,
    customer_description STRING
);

CREATE TABLE daily_transactions (
    record_no                INTEGER  PRIMARY KEY AUTOINCREMENT,
    transaction_date         DATE     NOT NULL,
    transaction_entered_date DATETIME DEFAULT (CURRENT_TIMESTAMP),
    cust_code                STRING   REFERENCES customers (cust_code) MATCH [FULL]
                                      NOT NULL,
    buy_or_sell              STRING   CONSTRAINT check_valid_action_string CHECK (buy_or_sell = 'buy' OR 
                                                                                  buy_or_sell = 'sell') 
                                      NOT NULL,
    trade_curr_code          STRING   REFERENCES currencies (currency_code) MATCH [FULL]
                                      NOT NULL,
    trade_curr_amount        DOUBLE   NOT NULL,
    rate                     DOUBLE   NOT NULL,
    reverse_rate             DOUBLE   NOT NULL,
    keyed_rate               STRING   CONSTRAINT check_valid_rate_string CHECK (keyed_rate = 'rate' OR 
                                                                                keyed_rate = 'rev_rate'),
    settlement_curr_amount   DOUBLE   NOT NULL,
    remarks                  STRING,
    edit_count               INTEGER,
    transaction_edited_date  DATETIME
);

CREATE TABLE daily_transactions_details (
    record_no   INTEGER PRIMARY KEY,
    curr_code   STRING  REFERENCES currencies (currency_code) MATCH [FULL],
    avg_rate    DOUBLE,
    profit_loss DOUBLE
);

CREATE TRIGGER buy_transaction_trigger
         AFTER INSERT
            ON daily_transactions
          WHEN NEW.buy_or_sell = 'buy'
BEGIN
    INSERT INTO daily_transactions_details (
                                               record_no,
                                               curr_code,
                                               avg_rate
                                           )
                                           VALUES (
                                               NEW.record_no,
                                               NEW.trade_curr_code,
                                               (
                                                   SELECT SUM(dt.settlement_curr_amount) / SUM(dt.trade_curr_amount) 
                                                     FROM daily_transactions dt
                                                    WHERE dt.trade_curr_code = NEW.trade_curr_code AND 
                                                          record_no != NEW.record_no
                                               )
                                           );
END;

CREATE TRIGGER sell_transaction_trigger
         AFTER INSERT
            ON daily_transactions
          WHEN NEW.buy_or_sell = 'sell'
BEGIN
    INSERT INTO daily_transactions_details VALUES (
                                               NEW.record_no,
                                               NEW.trade_curr_code,
                                               (
                                                   SELECT SUM(dt.settlement_curr_amount) / SUM(dt.trade_curr_amount) 
                                                     FROM daily_transactions dt
                                                    WHERE trade_curr_code = NEW.trade_curr_code AND 
                                                          dt.record_no != NEW.record_no
                                               ),
                                               ROUND( (NEW.settlement_curr_amount - (NEW.trade_curr_amount * (
                                                                                                                 SELECT SUM(dt.trade_curr_amount) / SUM(dt.settlement_curr_amount) 
                                                                                                                   FROM daily_transactions dt
                                                                                                                  WHERE dt.trade_curr_code = NEW.trade_curr_code AND 
                                                                                                                        dt.record_no != NEW.record_no
                                                                                                             )
                                                                                    ) ), 2) 
                                           );
END;
