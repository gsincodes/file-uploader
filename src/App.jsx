import SignUp from './Sign-Up.jsx'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './Home.jsx';
import LogIn from './Log-In.jsx';
import MyFolders from './My-Folders.jsx';
import CreateFolder from './Create-Folder.jsx';
import UploadFile from './Upload-File.jsx';
import LogOut from './Log-Out.jsx';

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home />} /> {/*Works*/}
          <Route path='/sign-up' element={<SignUp />} /> {/*Works*/}
          <Route path='/log-in' element={<LogIn />}/>{/*Works*/}
          <Route path='/log-out' element={<LogOut />}/>
          <Route path='/my-folders' element={<MyFolders />}/> {/*Works*/}
          <Route path='/my-folders/create' element={<CreateFolder />} /> {/*Works*/}
          <Route path='/my-folders/upload' element={<UploadFile />} />
          <Route path='/my-folders/:folderId' element={<MyFolders />} /> {/*Works*/}
          <Route path='/my-folders/:folderId/create' element={<CreateFolder />}/> {/*Works*/}
          <Route path='/my-folders/:folderId/upload' element={<UploadFile />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App