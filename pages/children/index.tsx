import { useState, useEffect } from "react";
import axios from "axios";

const ChildrenPage = () => {
  const [children, setChildren] = useState([]);

  const fetchData = async () => {
    try{
      const res = await axios.get("/api/children");
      setChildren(res.data);
    }
    catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    await axios.delete(`/api/children/${id}`);
    fetchData();
  };

  return (
    <div>
      <h1>子供一覧</h1>
      <ul>
        {children?.map((child) => (
          <li key={child.id}>
            {child.name}{" "}
            <button onClick={() => handleDelete(child.id)}>削除</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChildrenPage;