
# Backend Setup Instructions

## Prerequisites
- Python 3.8 or higher
- PostgreSQL database

## Installation

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Set up your PostgreSQL database and update the DATABASE_URL in main.py:
```python
DATABASE_URL = "postgresql://your_user:your_password@localhost/your_database"
```

4. Run the database schema:
```bash
psql -U your_user -d your_database -f database_schema.sql
```

5. Start the FastAPI server:
```bash
python main.py
```

The API will be available at http://localhost:8000
API documentation will be available at http://localhost:8000/docs
