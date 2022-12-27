import { RuleModel } from '../models/rules.model';

export class BaseRules {
  rules = [];

  init(rules: RuleModel[]) {
    this.rules = rules || [];
  }

  insertItem(rule: RuleModel) {
    this.rules.push(rule);
  }

  updateItem(rule: RuleModel) {
    const ruleIndex = this.rules.findIndex(r => r._id === rule._id);
    this.rules[ruleIndex] = rule;
  }

  deleteItem(rule: RuleModel) {
    this.rules = this.rules.filter(r => r._id !== rule._id);
  }
}
