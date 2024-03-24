export interface UserPersonalisation {
  personalisation_id: string;
  user_id: string;
  answers: Array<{ question: string; answer: string }>;
}

/**
 * @openapi
 * definitions:
 *  QuestionAnswer:
 *    properties:
 *      question:
 *        type: string
 *      answer:
 *        type: string
 */

export interface PersonalisationData {
  answers: Array<{ question: string; answer: string }>;
}