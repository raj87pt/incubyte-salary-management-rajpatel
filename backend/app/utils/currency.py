"""Currency exchange rates and normalization utilities."""

from decimal import Decimal, ROUND_HALF_UP

# Fixed exchange rates relative to USD (1 USD = X Currency)
# In production, this can be fetched from a live rates provider with caching.
EXCHANGE_RATES_TO_USD: dict[str, float] = {
    "USD": 1.0,
    "EUR": 1.08,      # 1 EUR = 1.08 USD
    "GBP": 1.28,      # 1 GBP = 1.28 USD
    "CAD": 0.74,      # 1 CAD = 0.74 USD
    "AUD": 0.65,      # 1 AUD = 0.65 USD
    "INR": 0.012,     # 1 INR = 0.012 USD
    "JPY": 0.0067,    # 1 JPY = 0.0067 USD
    "SGD": 0.75,      # 1 SGD = 0.75 USD
    "CHF": 1.13,      # 1 CHF = 1.13 USD
    "BRL": 0.18,      # 1 BRL = 0.18 USD
}


def convert_to_base_currency(amount: float | Decimal, from_currency: str) -> float:
    """Normalize any supported currency amount to USD."""
    rate = EXCHANGE_RATES_TO_USD.get(from_currency.upper(), 1.0)
    converted = float(amount) * rate
    return round(converted, 2)
