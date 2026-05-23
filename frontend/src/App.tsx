import './App.css'

import { useProjectsList, useCreateProject } from './hooks/useProjects'

// Home page
// list of all projects
function App() {
  const { 
    data: projects, 
    isPending: isProjectsPending, 
    isError: isProjectsError, 
    error: projectsError } = useProjectsList();

  const { 
    data: createprojectData, 
    isPending: isCreateProjectPending, 
    isSuccess: isCreateProjectSuccess, 
    isError: isCreateProjectError, 
    error: createProjectError } = useCreateProject();

  if (isProjectsPending) return <div>Loading projects...</div>;
  if (isProjectsError) return <div>Error: {projectsError.message}</div>;

  return (
    <div>
      {projects?.map((project) => (
        <div key={project.id}>{project.name}</div>
      ))}
    </div>
  )
}

export default App
