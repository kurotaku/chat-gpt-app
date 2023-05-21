import {
  User,
  Team,
  Subject,
  SubjectPrompt
} from '@prisma/client';

export type SerializableUser = Omit<User, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};

export type SerializableTeam = Omit<Team, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};

export type SerializableSubject = Omit<Subject, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};

export type SerializableSubjectPrompts = Omit<SubjectPrompt, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};
