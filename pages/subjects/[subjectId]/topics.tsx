import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import { PrismaClient, Subject, Topic } from '@prisma/client';
import Layout from '../../../components/Layout';
import { Header, Breadcrumb } from '../../../components/header/Header'


const prisma = new PrismaClient();

type SubjectPageProps = {
  subject: Subject;
  serverSideTopics: Topic[];
};

const Topics = ({ subject, serverSideTopics }: SubjectPageProps) => {
  const [topics, setTopics] = useState(serverSideTopics);

  return (
    <Layout title={`Subject: ${subject.name}`}>
      <Header>
        <h1>{subject.name}</h1>
      </Header>
      <Breadcrumb>
        <span>サブジェクト</span>
        <i className="icon-right_arrow" />
        <span><Link href={`/subjects/${subject.id}`}>{subject.name}</Link></span>
        <i className="icon-right_arrow" />
        <span>トピックス一覧</span>
      </Breadcrumb>
      {topics?.map((topic, index) => (
        <div key={index} className="bg-slate-200 p-8 mb-1">
          <h2 className="mb-2 bold">{topic.name}</h2>
          <p>{topic.content}</p>
        </div>
      ))}
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { subjectId } = context.params;
  const subject = await prisma.subject.findUnique({
    where: {
      id: Number(subjectId),
    },
  });

  if (!subject) {
    return {
      notFound: true,
    };
  }

  const serializedSubject = {
    ...subject,
    createdAt: subject.createdAt.toISOString(),
    updatedAt: subject.updatedAt.toISOString(),
  };

  const fetchTopics = await prisma.topic.findMany({
    where: {
      subjectId: subject.id
    }
  });
  const serverSideTopics = fetchTopics.map((topic) => ({
    ...topic,
    createdAt: topic.createdAt.toISOString(),
    updatedAt: topic.updatedAt.toISOString(),
  }));

  return {
    props: {
      subject: serializedSubject,
      serverSideTopics
    },
  };
};

export default Topics;