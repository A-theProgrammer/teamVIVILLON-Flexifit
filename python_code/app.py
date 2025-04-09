from flask import Flask, render_template, request, jsonify
from feedback_analyzer import FeedbackAnalyzer
from flask_cors import CORS

app = Flask(__name__)
CORS(app) 
# In-memory storage for demonstration (use database in production)
users = {
    'user1': FeedbackAnalyzer(user_experience='intermediate', baseline_fatigue=2.5)
}

@app.route('/')
def index():
    return render_template('index.html')
@app.route('/api/feedback', methods=['POST']) 
def handle_feedback():
    try:
        data = request.get_json()  # Better way to get JSON data
        print("Received data:", data)  # Debugging
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        user_id = data.get('user_id')
        if user_id not in users:
            return jsonify({'error': 'User not found'}), 404
        
        # Validate all required fields exist
        required_fields = ['fatigue', 'intensity', 'adherence', 'difficulty']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
        
        feedback = {field: data[field] for field in required_fields}
        analyzer = users[user_id]
        analyzer.add_feedback(feedback)
        
        score = analyzer.compute_score(feedback)
        progression = analyzer.get_progression_level(score)
        deload = analyzer.should_deload()
        
        return jsonify({
            'status': 'success',
            'score': score,
            'progression': progression,
            'deload': deload
        })
        
    except Exception as e:
        print("Error:", str(e))
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
