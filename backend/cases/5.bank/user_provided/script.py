import pandas as pd
from datetime import datetime
import os

def fill_df_temp(input_df, df_temp, datetime_value):
    input_df.reset_index(drop=True, inplace=True)
    if len(df_temp) < len(input_df):
        # 如果不够长，将df_temp扩展到与input_df同样的长度
        df_temp = df_temp.reindex(range(len(input_df)))
    # 检查第一列是否为NaN
    for index, row in input_df.iterrows():
        if pd.isna(row.iloc[0]):
            if index > 0:
                df_temp.at[index - 1, "账号"] = row.iloc[1]
                df_temp.at[index - 1, "账户层级"] = row.iloc[2]
                df_temp.at[index - 1, "当日可用额度"] = row.iloc[3]
                df_temp.at[index - 1, "当日保留额度"] = row.iloc[4]
                df_temp.at[index - 1, "当日冻结额度"] = row.iloc[5]
                df_temp.at[index - 1, "借方金额合计_外部支付"] = row.iloc[6]
                df_temp.at[index - 1, "借方金额合计_内部联动"] = row.iloc[7]
                df_temp.at[index - 1, "贷方总笔数"] = row.iloc[8]
                df_temp.at[index - 1, "贷方金额合计_外部收入"] = row.iloc[9]
                df_temp.at[index - 1, "贷方金额合计_内部联动"] = row.iloc[10]
        else:
            df_temp.at[index, "序号"] = row.iloc[0]
            df_temp.at[index, "账户名称"] = row.iloc[1]
            df_temp.at[index, "昨日可用额度"] = row.iloc[3]
            df_temp.at[index, "昨日保留额度"] = row.iloc[4]
            df_temp.at[index, "昨日冻结额度"] = row.iloc[5]
            df_temp.at[index, "借方金额合计"] = row.iloc[6]
            df_temp.at[index, "借方总笔数"] = row.iloc[8]
            df_temp.at[index, "贷方金额合计"] = row.iloc[9]
            df_temp.at[index, "当日净上存额度"] = row.iloc[11]
    df_temp.dropna(subset=["序号"], inplace=True)
    df_temp.reset_index(drop=True, inplace=True)
    df_temp["日期"] = datetime_value
    return df_temp

def dataTrans(inputFilePath, outputFilePath):
    df = pd.read_excel(inputFilePath)

    columns = [
    "日期", "序号", "账户名称", "账号", "账户层级",
    "昨日可用额度", "当日可用额度", "昨日保留额度", "当日保留额度",
    "昨日冻结额度", "当日冻结额度", "借方金额合计", "借方金额合计_外部支付",
    "借方金额合计_内部联动", "借方总笔数", "贷方总笔数", "贷方金额合计",
    "贷方金额合计_外部收入", "贷方金额合计_内部联动", "当日净上存额度"
    ]
    df_temp = pd.DataFrame(columns=columns)

    datetime_value = None
    for index, row in df.iterrows():
        if str(row[2]).startswith('地区号'):
            try:
                date_obj = datetime.strptime(row[12], "%Y年%m月%d日")
                datetime_value = date_obj.strftime("%Y/%m/%d")
                break
            except ValueError:
                continue

    first_column_name = df.columns[1]
    df_filter_title = df[df[first_column_name] != '中国工商银行境内资金池下属账户额度对账单汇总表']
    third_column_name = df_filter_title.columns[3]
    df_filter_title = df_filter_title[df_filter_title[third_column_name] != '账号']
    df_with_nan = df_filter_title[df_filter_title.iloc[:, 2].isna()]
    df_with_nan = df_with_nan[df_with_nan.iloc[:, 28].isna()]

    df_cleaned_row = df_with_nan.dropna(how='all')
    df_cleaned_all = df_cleaned_row.dropna(axis=1, how='all')

    df_temp = fill_df_temp(df_cleaned_all, df_temp, datetime_value)

    # df_temp['日期'] = pd.to_datetime(df_temp['日期']).dt.strftime('%Y/%m/%d')

    # tempPath = "Date(" + str(datetime_value) + ").xls"
    # df_temp.to_excel(tempPath, index=False)

    new_df_temp = df_temp.copy()


    # 此处为计算
    new_df_temp['temp_data'] = new_df_temp['昨日可用额度'] - new_df_temp['昨日保留额度']
    # print(outputFilePath)
    output = pd.read_excel(outputFilePath, index_col=0)



    for col in output.columns:
        if '\n' in col:
            output.columns = [col.split('\n')[0].replace(' ', '') for col in output.columns]
    
    for index, row in new_df_temp.iterrows():
        date = row['日期']
        account_name = row['账户名称'] + '(' + row['账号'] + ')'
        temp_data = row['temp_data']

        if date not in output.index:
            output.loc[date] = pd.Series(dtype='float64')
        if account_name not in output.columns:
            output[account_name] = pd.Series(dtype='float64')

        output.at[date, account_name] = temp_data

    output.index = pd.to_datetime(output.index).strftime('%Y/%m/%d')
    output.to_excel(outputFilePath)


def main():
    folder_path = './5.15'
    for filename in os.listdir(folder_path):
        file_path = os.path.join(folder_path, filename)
        everyday_data_path = file_path
        output_path = './output5.15.xls'
        dataTrans(everyday_data_path, output_path)

if __name__ == "__main__":
    main()