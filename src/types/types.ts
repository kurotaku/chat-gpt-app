import { User, UserConfig, Team, Subject, SubjectPrompt, Chat } from '@prisma/client';

export type SerializableUser = Omit<User, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};

export type SerializableUserConfig = Omit<UserConfig, 'createdAt' | 'updatedAt'> & {
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

export type SerializableChat = Omit<Chat, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};
