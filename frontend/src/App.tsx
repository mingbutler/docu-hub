import './App.css'

import { useProjects } from './hooks/useProjects'

// Home page
// list of all projects
function App() {
  const { data: projects, isLoading, isError, error } = useProjects();

  if (isLoading) return <div>Loading projects...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div>
      {projects?.map((project) => (
        <div key={project.id}>{project.name}</div>
      ))}
    </div>
  )
}

export default App
