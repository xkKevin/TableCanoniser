from flask import Flask, request, jsonify
import json

# from flask_cors import CORS # If frontend has set CORS, the backend doesn't need to set again.
from loguru import logger
from openai import OpenAI

# instantiate the app
app = Flask(__name__)
# Load configuration variables
# app.config.from_object(__name__)

# enable CORS
# CORS(app, resources={r'/*': {'origins': '*'}})
# CORS(app, supports_credentials=True) # Fix CORS warning
# flask configuration--------------------------------------------------------------


# load cases/5.bank/user_provided/input_tbl_first_200_rows.json data
MESSY_DATA = json.load(
    open("cases/5.bank/user_provided/input_tbl_first_200_rows.json")
)["input_tbl_first_200_rows"]


# openai chatGPT configuration--------------------------------------------------------------

api_key = ""

client = OpenAI(api_key=api_key)
# client = OpenAI()


# init_prompt = ""  # it can make chatGPT be some different role, for example: beautiful girl.

# By global `all_messages`, we can use it easily.
# it includes every bot&user messages.
# init the chatGPT

all_messages = {}
bot_name = "DT Assistant"
init_prompt = """You are a data transformation assistant. Your task is to write code that transforms messy tabular data into a relational table.

Here is an example of messy tabular data:
[["Rank", "Name", "Age"],
 ["1", "Bob", "16"],
 ["", "Score", "92"],
 ["2", "Sam", "15"], 
 ["", "Score", "89"]]

The desired relational table should look like this:
[["Rank", "Name", "Age", "Score"],
 ["1", "Bob", "16", "92"],
 ["2", "Sam", "15", "89"]]

 This is a script template:
 ```Python
import pandas as pd

# Load the messy DataFrame
df_messy = pd.read_csv("messy_data.csv", dtype=str, keep_default_na=False, header=None)
messy_data = df_messy.values

def transform_messy_data(messy_data):
    
    # Write code to transform the messy data into a relational table

    return transformed_df

transformed_df = transform_messy_data(messy_data)
```

In the upcoming conversation, I will give you the messy_data, and you need to complete the functionality of the `transform_messy_data` function. Note that your response should only be the code for the `transform_messy_data` function."""


def chat_init(bot_name=bot_name):
    all_messages[bot_name] = [
        {"role": "system", "content": init_prompt},
    ]
    logger.critical("\nRole: %s\nInit prompt: %s\n" % (bot_name, init_prompt))


# init_prompt = """You are a data transformation assistant. Your task is to generate a transformation script that converts messy, non-standard tabular data into a standardized relational table. The script should be clear, efficient, and easy to understand. Follow best practices for data manipulation and ensure the output matches the specified format.

#     Here is an example of messy, non-standard tabular data:
#     | Rank | Name | Age |
#     |------|------|-----|
#     |   1  |  Bob |  16 |
#     |      | Score | 92 |
#     |   2  |  Sam |  15 |
#     |      | Score | 89 |

#     The desired standardized relational table should look like this:
#     | Rank | Name | Age | Score |
#     |------|------|-----|-------|
#     |   1  |  Bob |  16 |  92   |
#     |   2  |  Sam |  15 |  89   |

#     In the following conversation, I will provide you with the two-dimensional form of the Messy table data, and then you can directly return the code to convert the Messy table into a standardized relational table. If I am not satisfied with your code, I will continue to provide text prompts for you to modify the code. You can only return the conversion script for the entire process, no additional output is required. """


def get_answer_from_bot(prompt, bot_name=bot_name):
    """
    1.prepare the input message according the bot which you talk to
    2.input the complete messages into model, to get the answer

    during this, log something for DEBUG in the future
    """
    try:
        messages = all_messages[bot_name]

        messages.append({"role": "user", "content": prompt})
        logger.info("user: " + prompt)

        # completion = openai.ChatCompletion.create(
        completion = client.chat.completions.create(
            # model="gpt-3.5-turbo",
            model="gpt-4o",
            messages=messages,
            # max_tokens=500,  # set the max answer length
        )

        message = completion.choices[0].message
        # message = {"role": "system", "content": "new_message: " + prompt}
        message = {"role": message.role, "content": message.content}
        messages.append(message)
        logger.info(
            "%s: %s \nMessage Length: %d"
            % (bot_name, message["content"], len(messages))
        )
        return message

    except KeyError as e:
        warning = "KeyError: %s." % e
        logger.warning(warning)
        return {"role": "system", "content": warning}
    except Exception as e:
        error = "Exception: %s." % e
        logger.error(error)
        message = {"role": "system", "content": error}
        return message


init_data_flag = False


@app.route("/get_answer", methods=["POST"])
def get_answer():
    # post_data = request.get_json()
    # logger.info("post_data: " + str(post_data))
    # prompt = post_data["prompt"]
    # bot_name = post_data["bot"]

    # return {"status": "success", "answer": get_answer_from_bot(bot_name, prompt)}
    global init_data_flag

    prompt = request.json.get("prompt")

    if not init_data_flag:
        init_data_flag = True
        prompt = "messy_data = " + json.dumps(MESSY_DATA) + "\n" + prompt
    message = get_answer_from_bot(prompt)

    return {"status": "success", "answer": message["content"]}


@app.route("/data_manager", methods=["POST"])
def data_manager():
    data = request.json  # .to_dict()  # request.args.get("param")
    variable = data.get("variable")
    value = data.get("value", None)
    response_data = {"status": False}
    if variable == "role":
        global init_prompt
        if value != None:
            init_prompt = value
            response_data["status"] = "Set role success"
            response_data["role"] = init_prompt
        else:
            response_data["status"] = "Get role success"
            response_data["role"] = init_prompt
        chat_init()

    if variable == "clear":
        logger.info("Clear Messages\n")
        chat_init()
        response_data["status"] = "Clear success"

    return jsonify(response_data)


@app.route("/get_example", methods=["GET"])
def get_example():
    param = request.args  # .to_dict()  # request.args.get("param")
    print(param)
    response_data = {
        "message": f"This is a GET request response with param: {param}",
        "received_data": param,
    }
    return jsonify(response_data)


@app.route("/post_example", methods=["POST"])
def post_example():
    data = request.json
    response_data = {
        "message": "This is a POST request response",
        "received_data": data,
    }
    return jsonify(response_data)


@app.route("/test", methods=["GET", "POST"])
def get_answer_test():

    # prompt = """messy_data = [["Unsupervised DA", "", "SOTA (image-based)", ""], ["baseline", "93.78", "DeepFace", "91.4"], ["PCA", "93.56", "FaceNet", "95.12"], ["CORAL", "94.5", "CenterFace", "94.9"], ["Ours (F)", "95.38", "CNN+AvePool", "95.2"]]
    # Please write code to transform the messy_data into a relational table as a DataFrame.
    # The output DataFrame should contain the following columns: Method, Accuracy, Category.
    # """
    params = request.args.to_dict()
    print(params)

    prompt = """messy_data = [["Unsupervised DA", "", "SOTA (image-based)", ""], ["baseline", "93.78", "DeepFace", "91.4"], ["PCA", "93.56", "FaceNet", "95.12"], ["CORAL", "94.5", "CenterFace", "94.9"], ["Ours (F)", "95.38", "CNN+AvePool", "95.2"]]"""

    response = get_answer_from_bot(prompt)
    print(response)

    return {"status": "success", "answer": response}


if __name__ == "__main__":
    logger.remove()  # remove the default logger, so that the log will not appear in the terminal
    logger.add(
        "./log/app.log",
        encoding="utf-8",
        format="{level} | {time:YYYY-MM-DD HH:mm:ss} | {file} | {line} | {message}",
        # enqueue=True,  # use threads to enqueue logs
        # retention="30 days",  # means when the log file exceeds 30 days, it will be deleted
        rotation="10 MB",  # means when the log file exceeds 10 MB, it will be renamed and a new log file will be created
    )

    # Before officially using the model, initialize the model by giving it `init_prompt`
    # chat_init()

    # Bind to all network interfaces
    app.run(host="0.0.0.0", port=5001, debug=True)
