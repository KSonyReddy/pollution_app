# Pollution Reporter Application

A web application for reporting and monitoring pollution levels across Telangana and India.

## Features

- User authentication and role-based access control
- Submit pollution reports with location, type, and severity
- Real-time map visualization of pollution levels
- Messaging system between users, team heads, and admins
- Admin dashboard for monitoring and management

## Installation

1. Clone the repository:
```
git clone https://github.com/yourusername/pollution_app.git
cd pollution_app
```

2. Create a virtual environment and activate it:
```
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install the required dependencies:
```
pip install -r requirements.txt
```

4. Initialize the database:
```
python
>>> from app import db
>>> db.create_all()
>>> exit()
```

5. Run the application:
```
python app.py
```

6. Open your browser and navigate to `http://localhost:5000`

## Usage

### User Dashboard
- Submit pollution reports
- View your submitted reports
- Send and receive messages
- View the pollution map

### Admin Dashboard
- Monitor all pollution reports
- Manage users
- View statistics and charts
- Respond to user messages

## Map Features

The pollution map shows:
- Color-coded markers indicating pollution levels:
  - Green: Low pollution
  - Yellow: Moderate pollution
  - Red: High pollution
- Click on markers to view detailed information
- Real-time updates when new reports are submitted

## Technologies Used

- Flask (Python web framework)
- SQLAlchemy (ORM)
- Flask-Login (Authentication)
- Flask-SocketIO (Real-time updates)
- Leaflet.js (Interactive maps)
- Chart.js (Data visualization)
- HTML/CSS/JavaScript (Frontend)

## License

This project is licensed under the MIT License - see the LICENSE file for details. 