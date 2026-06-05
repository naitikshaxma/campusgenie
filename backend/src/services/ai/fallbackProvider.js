/**
 * Mock Fallback Provider
 * Returns deterministic offline-safe responses for all CampusGenie AI features.
 */
class FallbackProvider {
  getFallbackForFeature(feature, prompt) {
    console.log(`[FallbackProvider] Serving mock data for feature: ${feature}`)
    
    switch (feature) {
      case 'chat':
        return this.getChatFallback(prompt)
      case 'assignment':
        return this.getAssignmentFallback(prompt)
      case 'planner':
        return this.getPlannerFallback(prompt)
      case 'notice':
        return this.getNoticeFallback(prompt)
      default:
        return 'CampusGenie AI service is waking up. Please try again in a moment.'
    }
  }

  getChatFallback(prompt) {
    const query = String(prompt).toLowerCase()
    
    if (query.includes('hello') || query.includes('hi ')) {
      return "Hello! I am CampusGenie AI, your student workspace companion. Ask me any questions about your studies, assignments, or daily plan."
    }
    if (query.includes('exam') || query.includes('test')) {
      return "Preparing for exams requires spaced repetition. I suggest creating a study plan with at least 3 separate study blocks: \n1. **Core Concept Review**: Summarize formulas & notes.\n2. **Practice Problems**: Solve last year's papers.\n3. **Active Recall Quiz**: Test yourself without helper materials."
    }
    if (query.includes('schedule') || query.includes('time')) {
      return "You can generate a structured calendar schedule using the **Study Planner** tab on the sidebar. Input your subject, hours, and target deadline, and I will generate study blocks for you."
    }

    return "CampusGenie AI backup engine activated. I am currently offline or switching backup servers. How can I help you organize your coursework today?"
  }

  getAssignmentFallback(prompt) {
    return {
      title: 'Course Homework Task',
      subject: 'General Study',
      dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      priority: 'medium',
      description: 'Extracted worksheet data. Review textbook chapter material and solve practice problems.',
      estimatedStudyHours: 2.5,
      confidence: 0.85,
      aiGenerated: true
    }
  }

  getPlannerFallback(prompt) {
    // Return a structured array of planner session objects
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
    const nextDay = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0]
    
    return [
      {
        subject: 'Core Revision',
        topic: 'Review key terms & outline chapters',
        duration: 1.5,
        date: tomorrow,
        startTime: '18:00',
        endTime: '19:30',
        notes: 'Spaced repetition block 1: Create active recall flashcards.'
      },
      {
        subject: 'Practice Set',
        topic: 'Solve sample questions and exercises',
        duration: 2.0,
        date: nextDay,
        startTime: '19:00',
        endTime: '21:00',
        notes: 'Spaced repetition block 2: Work through chapter exercises.'
      }
    ]
  }

  getNoticeFallback(prompt) {
    return {
      event: 'Campus Technical Seminar',
      date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      venue: 'Main Seminar Hall',
      registrationDeadline: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      description: 'Annual campus tech presentation and industrial expert talk. Register on the portal before the deadline.'
    }
  }
}

module.exports = new FallbackProvider()
