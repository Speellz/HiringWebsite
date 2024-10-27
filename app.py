from flask import Flask, render_template, request, jsonify
import pyodbc
import logging

logging.basicConfig(filename='app.log', level=logging.DEBUG)

# Create Flask app
app = Flask(__name__, static_folder='static')
app.config.from_object('config.Config')  # Load configuration from config.py

# Enable logging
logging.basicConfig(level=logging.DEBUG)

# Database connection configuration
conn_str = (
    "Driver={SQL Server};"
    "Server=SPELLZ\\SQLEXPRESS;"
    "Database=HiringDashboard;"
    "Trusted_Connection=yes;"
)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/candidates', methods=['GET'])
def get_candidates():
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        cursor.execute("""
           SELECT 
           c.Id, c.Name, c.Surname, c.Role, c.Status, c.StatusExplanation, c.Notes, 
           comp.CompanyName, pp.PositionName, u.UserName
           FROM Candidates c
           LEFT JOIN Company comp ON c.CompanyID = comp.CompanyID
           LEFT JOIN ProjectPositions pp ON c.PositionID = pp.PositionID
           LEFT JOIN Users u ON c.UserID = u.UserID
        """)
        rows = cursor.fetchall()
        candidates = [{
            'Id': row[0],
            'Name': row[1],
            'Surname': row[2],
            'Role': row[3],
            'Status': row[4],
            'StatusExplanation': row[5],
            'Notes': row[6],
            'CompanyName': row[7],
            'PositionName': row[8],
            'UserName': row[9],
        } for row in rows]
        return jsonify(candidates)
    except Exception as e:
        app.logger.error(f"Error fetching candidates: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/candidates/<int:id>', methods=['GET'])
def get_candidate_by_id(id):
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT 
                c.Id, c.Name, c.Surname, c.Role, c.Status, c.StatusExplanation, c.Notes, 
                comp.CompanyName, pp.PositionName, u.UserName
            FROM Candidates c
            LEFT JOIN Company comp ON c.CompanyID = comp.CompanyID
            LEFT JOIN ProjectPositions pp ON c.PositionID = pp.PositionID
            LEFT JOIN Users u ON c.UserID = u.UserID
            WHERE c.Id = ?
        """, (id,))
        row = cursor.fetchone()
        if row:
            candidate = {
                'Id': row[0],
                'Name': row[1],
                'Surname': row[2],
                'Role': row[3],
                'Status': row[4],
                'StatusExplanation': row[5],
                'Notes': row[6],
                'CompanyName': row[7],
                'PositionName': row[8],
                'UserName': row[9]
            }
            return jsonify(candidate)
        else:
            return jsonify({'error': 'Candidate not found'}), 404
    except Exception as e:
        app.logger.error(f"Error fetching candidate with id {id}: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/candidates', methods=['POST'])
def add_candidate():
    try:
        data = request.get_json()
        name = data.get('Name')
        surname = data.get('Surname')
        role = data.get('Role')
        status = data.get('Status')
        status_explanation = data.get('StatusExplanation', 'N/A')
        notes = data.get('Notes', 'N/A')
        company_id = data.get('CompanyID')  # Ensure this matches your database schema
        position_name = data.get('PositionName', 'N/A')

        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()

        # Validate company ID and position
        if not company_id:
            raise ValueError("Company ID is required")
        
        # Insert candidate into the database
        cursor.execute("""
            INSERT INTO Candidates (Name, Surname, Role, Status, StatusExplanation, Notes, CompanyID, PositionName) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (name, surname, role, status, status_explanation, notes, company_id, position_name))
        
        conn.commit()
        return jsonify({'message': 'Candidate added successfully'}), 201
    except Exception as e:
        app.logger.error(f"Error adding candidate: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/candidates/<int:id>', methods=['PUT'])
def update_candidate(id):
    try:
        data = request.get_json()
        name = data.get('Name')
        surname = data.get('Surname')
        role = data.get('Role')
        status = data.get('Status')
        status_explanation = data.get('StatusExplanation')
        notes = data.get('Notes')
        company_id = data.get('CompanyID')
        position_id = data.get('PositionID')
        user_id = data.get('UserID')

        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO Candidates (Name, Surname, Role, Status, StatusExplanation, Notes, CompanyID, PositionID, UserID)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (name, surname, role, status, status_explanation, notes, company_id, position_id, user_id))
        conn.commit()
        if cursor.rowcount > 0:
            return jsonify({'message': 'Candidate updated'})
        else:
            return jsonify({'error': 'Candidate not found'}), 404
    except Exception as e:
        app.logger.error(f"Error updating candidate with id {id}: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/candidates/<int:id>', methods=['DELETE'])
def delete_candidate(id):
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM Candidates WHERE Id = ?", (id,))
        conn.commit()
        if cursor.rowcount > 0:
            return jsonify({'message': 'Candidate deleted'})
        else:
            return jsonify({'error': 'Candidate not found'}), 404
    except Exception as e:
        app.logger.error(f"Error deleting candidate with id {id}: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/active-candidates', methods=['GET'])
def get_active_candidates_count():
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) AS count FROM Candidates WHERE Status = 'active'")
        row = cursor.fetchone()
        app.logger.debug(f"Active candidates count: {row[0]}")
        return jsonify({'count': row[0]})
    except Exception as e:
        app.logger.error(f"Error fetching active candidates count: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/passive-candidates', methods=['GET'])
def get_passive_candidates_count():
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) AS count FROM Candidates WHERE Status = 'passive'")
        row = cursor.fetchone()
        app.logger.debug(f"Passive candidates count: {row[0]}")
        return jsonify({'count': row[0]})
    except Exception as e:
        app.logger.error(f"Error fetching passive candidates count: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/companies', methods=['GET'])
def get_companies():
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM Company")  # Bu sorgunun doğru çalıştığından emin olun
        rows = cursor.fetchall()
        companies = [{'CompanyID': row[0], 'CompanyName': row[1], 'Role': row[2], 'Date': row[3]} for row in rows]
        return jsonify(companies)
    except Exception as e:
        app.logger.error(f"Error fetching companies: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/companies', methods=['POST'])
def add_company():
    try:
        data = request.get_json()
        company_name = data['CompanyName']
        role = data['Role']
        date = data['Date']

        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        cursor.execute("INSERT INTO Company (CompanyName, Role, Date) VALUES (?, ?, ?)", (company_name, role, date))
        conn.commit()
        return jsonify({'message': 'Company added'}), 201
    except Exception as e:
        app.logger.error(f"Error adding company: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/projects', methods=['GET'])
def get_projects():
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT Projects.Id, Projects.ProjectName, Company.CompanyName, Projects.ProjectDate 
            FROM Projects 
            JOIN Company ON Projects.CompanyID = Company.CompanyID
        """)
        rows = cursor.fetchall()
        projects = [{'ProjectID': row[0], 'ProjectName': row[1], 'CompanyName': row[2], 'ProjectDate': row[3]} for row in rows]
        return jsonify(projects)
    except Exception as e:
        app.logger.error(f"Error fetching projects: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/projects', methods=['POST'])
def add_project():
    try:
        data = request.get_json()
        project_name = data['ProjectName']
        company_id = data['CompanyID']
        project_date = data['ProjectDate']

        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        cursor.execute("INSERT INTO Projects (ProjectName, CompanyID, ProjectDate) VALUES (?, ?, ?)", (project_name, company_id, project_date))
        conn.commit()
        return jsonify({'message': 'Project added'}), 201
    except Exception as e:
        app.logger.error(f"Error adding project: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/projects/<int:project_id>/positions', methods=['GET'])
def get_project_positions(project_id):
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM ProjectPositions WHERE ProjectID = ?", (project_id,))
        rows = cursor.fetchall()
        positions = [{'PositionID': row[0], 'PositionName': row[2], 'CandidateCount': row[3]} for row in rows]
        return jsonify(positions)
    except Exception as e:
        app.logger.error(f"Error fetching positions for project {project_id}: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/projects/<int:project_id>/positions', methods=['POST'])
def add_project_position(project_id):
    try:
        data = request.get_json()
        position_name = data['PositionName']
        candidate_count = data['CandidateCount']

        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        cursor.execute("INSERT INTO ProjectPositions (ProjectID, PositionName, CandidateCount) VALUES (?, ?, ?)", (project_id, position_name, candidate_count))
        conn.commit()
        return jsonify({'message': 'Position added to project'}), 201
    except Exception as e:
        app.logger.error(f"Error adding position to project {project_id}: {e}")
        return jsonify({'error': str(e)}), 500

# Run the app with debug mode off
if __name__ == '__main__':
    app.run(debug=False)