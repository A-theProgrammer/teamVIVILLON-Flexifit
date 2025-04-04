from typing import List, Dict, Any, Optional


class TrainingData:
    def __init__(self,
                 training_time: int,           # in minutes
                 exercises: List[str],
                 intensity: float,             # 1-10 scale
                 completion: Dict[str, int]):  # e.g., {'sets': 3, 'reps': 10, 'calories': 100}
        self.training_time = training_time
        self.exercises = exercises
        self.intensity = intensity
        self.completion = completion

    def update_training_time(self, new_time: int) -> None:
        self.training_time = new_time

    def update_exercises(self, new_exercises: List[str]) -> None:
        self.exercises = new_exercises

    def update_intensity(self, new_intensity: float) -> None:
        self.intensity = new_intensity

    def update_completion(self, new_completion: Dict[str, int]) -> None:
        self.completion = new_completion


class ExerciseFeedback:
    def __init__(self,
                 difficulty: float,   # 1-10 scale
                 fatigue: float,      # 1-10 scale
                 satisfaction: float, # 1-10 scale
                 notes: Optional[str] = None):
        self.difficulty = difficulty
        self.fatigue = fatigue
        self.satisfaction = satisfaction
        self.notes = notes

    def update_ratings(self,
                       difficulty: Optional[float] = None,
                       fatigue: Optional[float] = None,
                       satisfaction: Optional[float] = None) -> None:
        if difficulty is not None:
            self.difficulty = difficulty
        if fatigue is not None:
            self.fatigue = fatigue
        if satisfaction is not None:
            self.satisfaction = satisfaction

    def update_notes(self, new_notes: str) -> None:
        self.notes = new_notes


class BehavioralData:
    def __init__(self,
                 usage_records: Dict[str, float],   # e.g., {'clicks': 25.0, 'browsing_time': 180.0, 'page_views': 10.0}
                 plan_adjustments: str):            # e.g., "drag-and-drop reordering"
        self.usage_records = usage_records
        self.plan_adjustments = plan_adjustments

    def update_usage_record(self, key: str, value: float) -> None:
        self.usage_records[key] = value

    def update_plan_adjustments(self, new_adjustments: str) -> None:
        self.plan_adjustments = new_adjustments


class FitnessUser:
    def __init__(self,
                 # Static Attributes
                 user_id: int,
                 age: int,
                 gender: str,
                 height: float,            # in cm
                 weight: float,            # in kg
                 health_conditions: str,   # e.g., "chronic knee pain", "no restrictions"
                 primary_goal: str,        # e.g., "fat loss", "muscle gain"
                 experience_level: str,    # e.g., "beginner", "intermediate", "advanced"
                 workout_habits: Dict[str, int]):  # e.g., {"weekly_sessions": 3, "session_length": 45}

        # Core Profile
        self.user_id = user_id
        self.age = age
        self.gender = gender
        self.height = height
        self.weight = weight
        self.health_conditions = health_conditions
        self.primary_goal = primary_goal
        self.experience_level = experience_level
        self.workout_habits = workout_habits

        # Dynamic Records
        self.training_log: List[TrainingData] = []
        self.feedback_history: List[ExerciseFeedback] = []
        self.behavioral_log: List[BehavioralData] = []

    def log_training(self,
                     training_time: int,      # in minutes
                     intensity: float,        # 1-10 scale
                     exercises: List[str],
                     completion_stats: Dict[str, int]) -> TrainingData:
        training_data = TrainingData(
            training_time=training_time,
            exercises=exercises,
            intensity=intensity,
            completion=completion_stats
        )
        self.training_log.append(training_data)

        return training_data

    def submit_feedback(self,
                        difficulty: float,
                        fatigue: float,
                        satisfaction: float,
                        notes: Optional[str] = None) -> ExerciseFeedback:
        feedback = ExerciseFeedback(
            difficulty=difficulty,
            fatigue=fatigue,
            satisfaction=satisfaction,
            notes=notes
        )
        self.feedback_history.append(feedback)

        return feedback

    def record_behavior(self,
                        usage_records: Dict[str, float],
                        plan_adjustments: str) -> BehavioralData:
        behavior = BehavioralData(
            usage_records=usage_records,
            plan_adjustments=plan_adjustments
        )
        self.behavioral_log.append(behavior)

        return behavior

    def update_profile(self,
                       new_age: Optional[int] = None,
                       new_weight: Optional[float] = None,
                       new_health_conditions: Optional[str] = None,
                       new_primary_goal: Optional[str] = None,
                       new_experience_level: Optional[str] = None,
                       new_workout_habits: Optional[Dict[str, int]] = None) -> None:
        if new_age is not None:
            self.age = new_age
        if new_weight is not None:
            self.weight = new_weight
        if new_health_conditions is not None:
            self.health_conditions = new_health_conditions
        if new_primary_goal is not None:
            self.primary_goal = new_primary_goal
        if new_experience_level is not None:
            self.experience_level = new_experience_level
        if new_workout_habits is not None:
            self.workout_habits = new_workout_habits