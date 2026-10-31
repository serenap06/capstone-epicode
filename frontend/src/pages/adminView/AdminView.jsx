import { useAuth } from "../../hooks/useAuth"
import { Button } from "react-bootstrap"

 const AdminView = ()=>{
    const {user,logout} = useAuth()
    return (
    <div>
        <h1>Sei nella pagina admin</h1>
        <p>ciao {user.name}</p>
        <Button onClick={logout}>Esci</Button>
    </div>
    )
}

export default AdminView

