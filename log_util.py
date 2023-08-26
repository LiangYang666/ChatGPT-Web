import sys
import logging
from logging.handlers import RotatingFileHandler


def init_logger(file_name="running.log", logger_name="my_logger", log_level=logging.INFO,  stdout=False):

    logger = logging.getLogger(logger_name)
    logger.setLevel(log_level)

    # 格式定义
    log_format = '%(asctime)s - %(levelname)s - %(message)s'
    formatter = logging.Formatter(log_format)

    # 文件日志，单个文件最大10M
    handler = RotatingFileHandler(file_name, maxBytes=10 * 1024 * 1024, backupCount=10)
    handler.setFormatter(formatter)
    logger.addHandler(handler)

    if stdout:
        stream_handler = logging.StreamHandler(sys.stdout)
        stream_handler.setFormatter(formatter)
        logger.addHandler(stream_handler)

    return logger
