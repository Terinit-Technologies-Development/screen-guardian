let pending = false;

export function queueAchievementEvaluation() {
  if (pending) return;
  pending = true;

  setTimeout(() => {
    pending = false;
    import('../store/achievementStore')
      .then(({ useAchievementStore }) => useAchievementStore.getState().evaluateAchievements())
      .catch(error => console.error('Failed to evaluate achievements:', error));
  }, 0);
}
