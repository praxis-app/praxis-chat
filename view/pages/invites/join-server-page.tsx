import { useParams } from 'react-router-dom';

export const JoinServerPage = () => {
  const { token } = useParams();

  if (!token) {
    return <div>Invalid invite</div>;
  }

  return (
    <div>
      <h1>Join Server</h1>
      <p>TODO: Implement join server page</p>
      <p>Token: {token}</p>
    </div>
  );
};
