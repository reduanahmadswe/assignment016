export class OpportunityTransformer {
  /**
   * Transform single opportunity - extract code from relation objects
   */
  transform(opportunity: any) {
    return {
      ...opportunity,
      type: opportunity.type.code,
      status: opportunity.status.code,
    };
  }

  /**
   * Transform list of opportunities
   */
  transformList(opportunities: any[]) {
    return opportunities.map(opp => ({
      ...opp,
      type: opp.type.code,
      status: opp.status.code,
    }));
  }
}

export const opportunityTransformer = new OpportunityTransformer();
