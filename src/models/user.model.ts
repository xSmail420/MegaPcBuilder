import { ChatroomModel } from "./chatroom.model";

export enum UserQuestion {
    Name = "What is your name?",
    Age = "How old are you?",
    Gender = "What is your gender?",
    Occupation = "What is your occupation?",
    Location = "Where are you located?",
}

export interface UserModel {
  user_id: string,
  name: string,
  age: number,
  gender: string,
  occupation: string,
  location: string,
  personalisation_id: string,
  chatrooms: ChatroomModel[]
}