class FeedbackAnalyzer:
    def __init__(self, user_experience, baseline_fatigue):
        self.user_experience = user_experience
        self.baseline_fatigue = baseline_fatigue
        self.feedback_history = []
        
        self.weights = {
            'intensity': 0.5,
            'adherence': 0.3,
            'fatigue': -0.1,
            'difficulty': -0.1
        }

    def add_feedback(self, feedback):
        self.feedback_history.append(feedback)

    def compute_score(self, feedback):
        score = 0
        for key, value in feedback.items():
            if key in self.weights:
                score += value * self.weights[key]
        return round(score, 2)

    def get_progression_level(self, score):
        thresholds = {
            'beginner': {'progressing': 3.0, 'plateauing': 2.0},
            'intermediate': {'progressing': 4.0, 'plateauing': 3.0},
            'advanced': {'progressing': 4.5, 'plateauing': 3.5}
        }

        if self.user_experience not in thresholds:
            raise ValueError(f"Invalid experience level: {self.user_experience}")

        progressing = thresholds[self.user_experience]['progressing']
        plateauing = thresholds[self.user_experience]['plateauing']

        if score >= progressing:
            return "progressing"
        elif score >= plateauing:
            return "plateauing"
        else:
            return "regressing"

    def should_deload(self, consecutive_weeks=2):
        if len(self.feedback_history) < consecutive_weeks:
            return False

        recent_fatigue = [week['fatigue'] for week in 
                          self.feedback_history[-consecutive_weeks:]]
        return all(f > self.baseline_fatigue for f in recent_fatigue)
