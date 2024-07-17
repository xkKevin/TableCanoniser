import random
from decimal import Decimal, getcontext

getcontext().prec = 8  # 设置小数精度为8位


def generate_decimal(min_val, max_val):
    rand_val = random.uniform(float(min_val), float(max_val))
    rand_val = round(rand_val, 2)  # 四舍五入保留两位小数
    return Decimal(str(rand_val))


def generate_integer(min_val, max_val):
    return random.randint(min_val, max_val)


def generate_random_data():
    data = []
    for i in range(1, 26):
        yesterday_available_credit = generate_decimal(100000.00, 100000000.00)
        yesterday_reserved_credit = generate_decimal(
            0.00, float(yesterday_available_credit) / 2
        )
        yesterday_frozen_credit = generate_decimal(
            0.00, float(yesterday_reserved_credit) / 2
        )
        if random.randint(0, 10) < 4:
            yesterday_frozen_credit = 0.00

        today_net_deposit_amount = generate_decimal(-20000.00, 30000.00)
        today_available_credit = float(str(yesterday_available_credit)) + float(
            str(today_net_deposit_amount)
        )
        today_reserved_credit = generate_decimal(
            0.00, float(today_available_credit) / 2
        )
        today_frozen_credit = yesterday_frozen_credit

        total_debit_transactions = generate_integer(0, 10)
        total_debit_amount = (
            generate_decimal(100.00, 100000.00) if total_debit_transactions > 0 else 0
        )
        total_credit_transactions = generate_integer(0, 10)
        total_credit_amount = (
            generate_decimal(100.00, 100000.00) if total_credit_transactions > 0 else 0
        )

        data.append(
            {
                "Index": i,
                "Sub Account Name": f"Sub Bank A{i}",
                "Yesterday Available Credit": yesterday_available_credit,
                "Yesterday Reserved Credit": yesterday_reserved_credit,
                "Yesterday Frozen Credit": yesterday_frozen_credit,
                "Total Debit Transactions": total_debit_transactions,
                "Total Debit Amount": total_debit_amount,
                "Today Net Deposit Amount": today_net_deposit_amount,
                "Today Available Credit": today_available_credit,
                "Today Reserved Credit": today_reserved_credit,
                "Today Frozen Credit": today_frozen_credit,
                "Total Credit Transactions": total_credit_transactions,
                "Total Credit Amount": total_credit_amount,
            }
        )

    return data


# 生成数据
random_data = generate_random_data()

# 打印结果
print(
    "Summary Statement of Account Limits for Accounts under Domestic Fund Pool of a Bank,,,,,,,,,,,"
)
print(",,,,,,,,,,,")
print("Region Code:,1111,,Branch Code:,1001,,2020/1/1,,Currency:,CNY,,Page 1")
print("Account No.:,12345,,Account Name:,Main Bank A,,,,,,Agreement No.:,123123123")
print(",,,,,,,,,,,")
print(
    "Index,Sub Account Name,,Yesterday Available Credit,Yesterday Reserved Credit,Yesterday Frozen Credit,,Total Debit Transactions,Total Debit Amount,,,Today Net Deposit Amount "
)
print(
    ",Sub Account No.,,Today Available Credit,Today Reserved Credit,Today Frozen Credit,,Total Credit Transactions,Total Credit Amount,,,"
)

for record in random_data:
    print(
        f"{record['Index']},{record['Sub Account Name']},,{record['Yesterday Available Credit']:.2f},{record['Yesterday Reserved Credit']:.2f},{record['Yesterday Frozen Credit']:.2f},,{record['Total Debit Transactions']},{record['Total Debit Amount']},,,{record['Today Net Deposit Amount']:.2f}"
    )
    print(
        f",{1234500 + record['Index']}0,,{record['Today Available Credit']:.2f},{record['Today Reserved Credit']:.2f},{record['Today Frozen Credit']:.2f},,{record['Total Credit Transactions']},{record['Total Credit Amount']},,,"
    )
