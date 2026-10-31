import { useAuth } from "../../hooks/useAuth"
import { Button } from "react-bootstrap"

 const EmployeeView = ()=>{
    const {user,logout} = useAuth()
    return (
    <div>
        <h1>Sei nella pagina employee</h1>
        <p>ciao {user.name}</p>
        <Button onClick={logout}>Esci</Button>
    </div>
    )
}

export default EmployeeView

