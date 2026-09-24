import mongoose from 'mongoose';

const PaperSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true,
    index: true 
  },
  // 1. Title Part
  title: { 
    type: String, 
    required: true 
  },
  authors: [{ 
    type: String 
  }],
  publishedYear: { 
    type: String 
  },
  venue: { 
    type: String 
  },
  
  // 2. Abstract
  abstract: { 
    type: String 
  },
  
  // 3. Introduction
  introduction: { 
    type: String 
  },
  
  // 4. Literature Review
  literatureReview: { 
    type: String 
  },
  
  // 5. Methodology
  methodology: { 
    type: String 
  },
  
  // 6. Results
  results: { 
    type: String 
  },
  
  // 7. Discussion & Conclusion
  discussion: { 
    type: String 
  },
  conclusion: { 
    type: String 
  },
  
  // Additional Academic Metadata
  limitationsAndFutureWork: { 
    type: String 
  },
  tablesAndFigures: { 
    type: String 
  },
  appendix: { 
    type: String 
  },
  
  // References (APA / IEEE format citations)
  references: [{ 
    type: String 
  }],
  
  fileName: { 
    type: String 
  },
  isPinned: { 
    type: Boolean, 
    default: false 

  }, // For pinning important papers
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

export default mongoose.models.Paper || mongoose.model('Paper', PaperSchema);