from dotenv import load_dotenv
import os

load_dotenv()

PROJECT_NAME = "InsightX"
ENV = os.getenv("ENV", "development")
