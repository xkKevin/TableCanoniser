from flask import Flask, request

# from flask_cors import CORS # If frontend has set CORS, the backend doesn't need to set again.
# from loguru import logger
import logging
from logging.handlers import RotatingFileHandler
from openai import OpenAI

# flask configuration--------------------------------------------------------------
DEBUG = True

# instantiate the app
app = Flask(__name__)
# Load configuration variables
# app.config.from_object(__name__)

# enable CORS
# CORS(app, resources={r'/*': {'origins': '*'}})
# CORS(app, supports_credentials=True) # Fix CORS warning
# flask configuration--------------------------------------------------------------


# 设置日志格式
log_formatter = logging.Formatter(
    "%(levelname)s | %(asctime)s | %(lineno)d | %(message)s"
)

# 创建日志处理器，基于文件大小进行轮转
log_handler = RotatingFileHandler("app.log", maxBytes=10 * 1024 * 1024, backupCount=5)
log_handler.setFormatter(log_formatter)
log_handler.setLevel(logging.INFO)

# 设置处理器为非缓冲模式
# log_handler.flush()
log_handler.terminator = "\n"

# 设置日志记录器
app.logger.addHandler(log_handler)
app.logger.setLevel(logging.INFO)


# openai chatGPT configuration--------------------------------------------------------------
# api_key = "sk-proj-1VQ3WP8h1ZvSkOrG8qJaT3BlbkFJvd2S7qweIV904dYafmVC"
api_key = "sk-proj-37sNgWLb66Dui8lQKhxqT3BlbkFJChZg74ToeB2jXHOflbK4"

client = OpenAI(api_key=api_key)
# client = OpenAI()


# init_prompt = ""  # it can make chatGPT be some different role, for example: beautiful girl.

# By global `all_messages`, we can use it easily.
# it includes every bot&user messages.
# init the chatGPT

all_messages = {}
bot_name = "DT Assistant"
init_prompt = """You are a data transformation assistant. Your task is to generate a script that converts messy tabular data into a relational table.

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

In the following conversation, I will provide you with messy tabular data, and you will return the code to convert it into a standardized relational table. If I am not satisfied with your code, I will provide further prompts for modifications. You should only return the transformation script."""


def chat_init(bot_name=bot_name):
    app.logger.critical("System initializing.")

    all_messages["DT Assistant"] = [
        {"role": "system", "content": init_prompt},
    ]

    app.logger.info("Role: %s\nInit prompt: %s" % (bot_name, init_prompt))


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
        app.logger.info("user: " + prompt)

        # completion = openai.ChatCompletion.create(
        # completion = client.chat.completions.create(
        #     # model="gpt-3.5-turbo",
        #     model="gpt-4o",
        #     messages=messages,
        #     # max_tokens=500,  # set the max answer length
        # )

        # message = completion.choices[0].message
        message = prompt + "sdfsdfsdfsdfsdf"
        messages.append(message)
        app.logger.info("%s: %s" % (bot_name, message))
        return message

    except KeyError:
        app.logger.warning("all_messages[%s] is none, so init it." % bot_name)
        all_messages[bot_name] = [
            {
                "role": "system",
                "content": init_prompt,
            }
        ]
        return get_answer_from_bot(prompt, bot_name)
    except Exception as e:
        app.logger.error(e)
        return "Sorry, I'm having trouble. Please try again later."


@app.route("/get_answer", methods=["GET", "POST"])
def get_answer():
    # post_data = request.get_json()
    # app.logger.info("post_data: " + str(post_data))
    # prompt = post_data["prompt"]
    # bot_name = post_data["bot"]

    # return {"status": "success", "answer": get_answer_from_bot(bot_name, prompt)}

    return {"status": "success", "answer": get_answer_from_bot("hello")}


if __name__ == "__main__":
    # logger.add(
    #     "./log/run.log",
    #     encoding="utf-8",
    #     format="{level} | {time:YYYY-MM-DD HH:mm:ss} | {file} | {line} | {message}",
    #     enqueue=True,  # use threads to enqueue logs
    #     retention="30 days",  # means when the log file exceeds 30 days, it will be deleted
    #     rotation="10 MB",  # means when the log file exceeds 10 MB, it will be renamed and a new log file will be created
    # )

    # Before officially using the model, initialize the model by giving it `init_prompt`
    chat_init()

    # Bind to all network interfaces
    app.run(host="0.0.0.0", port=5001)

    # prompt = """messy_data = [["Unsupervised DA", "", "SOTA (image-based)", ""], ["baseline", "93.78", "DeepFace", "91.4"], ["PCA", "93.56", "FaceNet", "95.12"], ["CORAL", "94.5", "CenterFace", "94.9"], ["Ours (F)", "95.38", "CNN+AvePool", "95.2"]]
    # Please write code to transform the messy_data into a relational table as a DataFrame.
    # The output DataFrame should contain the following columns: Method, Accuracy, Category.
    # """

    prompt = """messy_data = [["Unsupervised DA", "", "SOTA (image-based)", ""], ["baseline", "93.78", "DeepFace", "91.4"], ["PCA", "93.56", "FaceNet", "95.12"], ["CORAL", "94.5", "CenterFace", "94.9"], ["Ours (F)", "95.38", "CNN+AvePool", "95.2"]]"""

    print(get_answer_from_bot(prompt))
