import { GetServerSideProps } from 'next';
import { useState, useEffect } from 'react'
import { useSession } from "next-auth/react"
import axios from 'axios'
import Link from 'next/link'
import Layout from '../../components/Layout'
import fetchCurrentUser from '../../utils/fetchCurrentUser';
import { Header } from '../../components/header/Header'
import { PrismaClient, Subject } from '@prisma/client';
const prisma = new PrismaClient();

type SubjectsIndexProps = {
  serverSideSubjects: Subject[];
};

export const getServerSideProps: GetServerSideProps = async () => {
  const response = await prisma.subject.findMany();
  const serverSideSubjects = response.map((subject) => ({
    ...subject,
    createdAt: subject.createdAt.toISOString(),
    updatedAt: subject.updatedAt.toISOString(),
  }));

  return {
    props: {
      serverSideSubjects,
    },
  };
};

const SubjectsIndex = ({ serverSideSubjects }: SubjectsIndexProps) => {
  
  const { data: session } = useSession()
  const [user, setUser] = useState(null);
  const [subjects, setSubjects] = useState(serverSideSubjects);

  const fetcSubjects = async () => {
    const response = await axios.get('/api/subjects');
    setSubjects([...response.data]);
  }

  useEffect(() => {
    const getUser = async () => {
      const fetchedUser = await fetchCurrentUser(session);
      setUser(fetchedUser);
    };
    getUser();
  }, [session]);

  return (
    <Layout title="Subject">
      <Header>
        <h1>サブジェクト</h1>
      </Header>
      {subjects?.map((subject, index) => (
        <Link
          href={`/subjects/${subject.id}`}
          className="block bg-slate-200 hover:bg-slate-300 p-8 mb-2"
        >
          {subject.name}
        </Link>
      ))}
      
    </Layout>
  )
}

export default SubjectsIndex;