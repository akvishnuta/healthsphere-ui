import React, { useState, useEffect, useMemo } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CForm,
  CFormLabel,
  CFormInput,
  CFormSelect,
  CButton,
  CAlert,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import DataTable from 'react-data-table-component'
import { HealthSphere } from 'src/components'

const PatientRegistration = () => {
  const BASE_URL = 'http://localhost:8443'
  const ageList = []
  for (let i = 0; i < 120; i++) {
    ageList.push('' + i)
  }
  const getDateStr = (date) => {
    return (
      date.getFullYear() -
      age +
      '-' +
      String(date.getMonth() + 1).padStart(2, '0') +
      '-' +
      date.getDate()
    )
  }

  const getAgeStr = () => {
    const today = new Date()
    return today.getFullYear() - new Date(body.dateOfBirth).getFullYear()
  }

  const [data, setData] = useState(null)
  const [age, setAge] = useState(5)
  const [confirmModalData, setConfirmModalData] = useState({ visible: false })
  const [body, setBody] = useState({
    dateOfBirth: getDateStr(new Date()),
    height: 170,
    weight: 70,
  })
  const [saveResponse, setSaveResponse] = useState(null)
  const [status, setStatus] = useState({})
  const [searchQuery, setSearchQuery] = useState({})
  const [loading, setLoading] = useState(false)
  const [totalRows, setTotalRows] = useState(0)
  const [departmentList, setDepartmentList] = useState([])
  const [doctorList, setDoctorList] = useState([])

  useMemo(() => {
    setBody({
      ...body,
      dateOfBirth: getDateStr(new Date()),
    })
  }, [age])
  useMemo(() => {
    setAge(getAgeStr())
  }, [body.dateOfBirth])

  fetch(BASE_URL + '/v1/department/list')
    .then((response) => response.json())
    .then((json) => {
      setDepartmentList([...json.data])
    })
    .catch((error) => console.error(error))

  useMemo(() => {
    if (body.department) {
      fetch(BASE_URL + '/v1/doctor/search?count=100&department=' + body.department)
        .then((response) => response.json())
        .then((json) => {
          const docList = []
          json.data.list.forEach((doc) => {
            docList.push({ label: doc.firstName, value: doc.id })
          })
          setDoctorList(docList)
        })
        .catch((error) => console.error(error))
    }
  }, [body.department])

  const validateSearchQuery = () => {
    let isValid = false
    for (const key in searchQuery) {
      if (searchQuery[key] && searchQuery[key] !== '') isValid = true
    }
    return isValid
  }

  useMemo(() => {
    if (validateSearchQuery() && body.department && body.doctor) {
      const query = {
        ...searchQuery,
        department: body.department,
        doctor: body.doctor,
      }
      const queryStr = objToQueryString(query)
      fetch(BASE_URL + '/v1/patient/search?' + queryStr)
        .then((response) => response.json())
        .then((json) => {
          setData([...json.data.list])
          setTotalRows(json.data.totalRecords)
        })
        .catch((error) => console.error(error))
    }
  }, [saveResponse, searchQuery, body.department, body.doctor])

  function objToQueryString(obj) {
    const keyValuePairs = []
    for (const key in obj) {
      keyValuePairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]))
    }
    return keyValuePairs.join('&')
  }

  const handlePerRowsChange = (newPerPage, page) => {
    setSearchQuery({
      ...searchQuery,
      page: page - 1,
      count: newPerPage,
    })
  }

  const handlePageChange = (page) => {
    setSearchQuery({
      ...searchQuery,
      page: page - 1,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await fetch(BASE_URL + '/v1/patient', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then((response) => {
        setSaveResponse(response)
        response.status === 200
          ? setStatus({ type: 'success' })
          : setStatus({ type: 'error', error: statusText })
        setSearchQuery({
          ...searchQuery,
          department: body.department,
        })
        clearAll()
      })
      .catch((error) => {
        setStatus({ type: 'error', error })
        console.error(error)
      })
      .finally(() => setLoading(false))
    closeModal()
    setLoading(false)
  }

  const handleDelete = async (e) => {
    e.preventDefault()
    setLoading(true)
    await fetch(BASE_URL + '/v1/patient/' + body.id, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((response) => {
        response.status === 200
          ? setStatus({ type: 'success' })
          : setStatus({ type: 'error', error: statusText })
        setSearchQuery({
          ...searchQuery,
          department: body.department,
        })
        clearAll()
      })
      .catch((error) => {
        setStatus({ type: 'error', error })
        console.error(error)
      })
      .finally(() => setLoading(false))
    closeModal()
    setLoading(false)
  }

  const handleRowClicked = (row, _e) => {
    setBody({
      ...body,
      id: row.id,
      firstName: row.firstName ? row.firstName : '',
      lastName: row.lastName ? row.lastName : '',
      department: row.department ? row.department : '',
      email: row.email ? row.email : '',
      mobileNo: row.mobileNo ? row.mobileNo : '',
    })
  }

  const clearAll = () => {
    setBody({
      ...body,
      id: '',
      firstName: '',
      lastName: '',
      department: '',
      email: '',
      mobileNo: '',
    })
  }

  const showModal = (yesCallback, cancelCallBack, modalTitle, modalBody) => {
    setConfirmModalData({
      ...confirmModalData,
      yesCallback,
      cancelCallBack,
      modalTitle,
      modalBody,
      visible: true,
    })
  }

  const closeModal = () => {
    setConfirmModalData({
      ...confirmModalData,
      visible: false,
    })
  }

  const columns = [
    {
      name: 'Id',
      selector: (row) => row.id,
    },
    {
      name: 'First Name',
      selector: (row) => row.firstName,
    },
    {
      name: 'Last Name',
      selector: (row) => row.lastName,
    },
    {
      name: 'Mobile No.',
      selector: (row) => row.mobileNo,
    },
    {
      name: 'Email',
      selector: (row) => row.email,
    },
    {
      name: 'Modified On',
      selector: (row) => row.modifiedOn,
    },
    {
      name: 'Created On',
      selector: (row) => row.createdOn,
    },
  ]
  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Patient Registration</strong>
            <CForm>
              <div className="row">
                <div className="mb-3 col-lg-6">
                  <CFormLabel htmlFor="department">Department</CFormLabel>
                  <CFormSelect
                    aria-label="Default select example"
                    options={['Select Department', ...departmentList]}
                    onChange={(e) => {
                      return setBody({
                        ...body,
                        department: e.target.value,
                      })
                    }}
                    value={body.department}
                  />
                </div>
                <div className="mb-3 col-lg-6">
                  <CFormLabel htmlFor="doctor">Doctor</CFormLabel>
                  <CFormSelect
                    aria-label="Default select example"
                    options={['Select Doctor', ...doctorList]}
                    onChange={(e) => {
                      return setBody({
                        ...body,
                        doctor: e.target.value,
                      })
                    }}
                    value={body.doctor}
                  />
                </div>
              </div>
            </CForm>
          </CCardHeader>
          <CCardBody>
            <p className="text-body-secondary small">Add Details.</p>
            {status.type === 'success' && <CAlert color="success">Data added successfully</CAlert>}
            {status.type === 'error' && (
              <CAlert color="danger">
                An unexpected error occured! Please contact your system admin.
              </CAlert>
            )}
            <HealthSphere href="forms/form-control">
              <CForm>
                {body.id && (
                  <div className="row">
                    <div className="mb-3 col-lg-3">
                      <CFormLabel htmlFor="id">Update for Doctor Id</CFormLabel>
                      <CFormInput
                        onChange={(e) => {
                          return setBody({
                            ...body,
                            lastName: e.target.value,
                          })
                        }}
                        type="text"
                        value={body.id}
                        id="id"
                        placeholder="Id"
                        disabled
                      />
                    </div>
                  </div>
                )}
                <div className="row">
                  <div className="mb-3 col-lg-3">
                    <CFormLabel htmlFor="firstName">First Name</CFormLabel>
                    <CFormInput
                      onChange={(e) => {
                        return setBody({
                          ...body,
                          firstName: e.target.value,
                        })
                      }}
                      value={body.firstName}
                      type="text"
                      id="firstname"
                      placeholder="First Name"
                    />
                  </div>
                  <div className="mb-3 col-lg-3">
                    <CFormLabel htmlFor="lastName">Last Name</CFormLabel>
                    <CFormInput
                      onChange={(e) => {
                        return setBody({
                          ...body,
                          lastName: e.target.value,
                        })
                      }}
                      type="text"
                      value={body.lastName}
                      id="lastname"
                      placeholder="Last Name"
                    />
                  </div>
                  <div className="mb-3 col-lg-2">
                    <CFormLabel htmlFor="dateOfBirth">Date of Birth</CFormLabel>
                    <CFormInput
                      onChange={(e) => {
                        return setBody({
                          ...body,
                          dateOfBirth: e.target.value,
                        })
                      }}
                      type="date"
                      value={body.dateOfBirth}
                      id="dateOfBirth"
                    />
                  </div>
                  <div className="mb-3 col-lg-1">
                    <CFormLabel htmlFor="age">Age</CFormLabel>
                    <CFormSelect
                      onChange={(e) => {
                        return setAge(e.target.value)
                      }}
                      options={ageList}
                      value={age}
                      id="age"
                    />
                  </div>

                  <div className="mb-3 col-lg-1">
                    <CFormLabel htmlFor="height">Height (cms)</CFormLabel>
                    <CFormInput
                      onChange={(e) => {
                        return setBody({ ...body, height: e.target.value })
                      }}
                      type="number"
                      value={body.height}
                      id="hieght"
                    />
                  </div>

                  <div className="mb-3 col-lg-1">
                    <CFormLabel htmlFor="age">Weight (Kg)</CFormLabel>
                    <CFormInput
                      onChange={(e) => {
                        return setBody({ ...body, weight: e.target.value })
                      }}
                      type="number"
                      value={body.weight}
                      id="weight"
                    />
                  </div>

                  <div className="mb-3 col-lg-1">
                    <CFormLabel htmlFor="age">Gender</CFormLabel>
                    <CFormSelect
                      onChange={(e) => {
                        return setBody({ ...body, gender: e.target.value })
                      }}
                      options={['M', 'F']}
                      value={body.gender}
                      id="gender"
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="mb-3 col-lg-3">
                    <CFormLabel htmlFor="address">Address</CFormLabel>
                    <CFormInput
                      onChange={(e) => {
                        return setBody({
                          ...body,
                          address: e.target.value,
                        })
                      }}
                      value={body.address}
                      type="text"
                      id="address"
                      placeholder="Address"
                    />
                  </div>
                  <div className="mb-3 col-lg-3">
                    <CFormLabel htmlFor="email">Email address</CFormLabel>
                    <CFormInput
                      onChange={(e) => {
                        return setBody({
                          ...body,
                          email: e.target.value,
                        })
                      }}
                      type="email"
                      id="email"
                      placeholder="name@domain.com"
                      value={body.email}
                    />
                  </div>
                  <div className="mb-3 col-lg-3">
                    <CFormLabel htmlFor="mobileNo">Mobile No</CFormLabel>
                    <CFormInput
                      onChange={(e) => {
                        return setBody({
                          ...body,
                          mobileNo: e.target.value,
                        })
                      }}
                      type="text"
                      id="mobileNo"
                      placeholder="+xx-xxxxxxxxxx"
                      value={body.mobileNo}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="mb-3 col-lg-9"></div>
                  <div className="col-lg-3">
                    {body.id && (
                      <CButton color="info" onClick={clearAll}>
                        Add New
                      </CButton>
                    )}
                    <CButton
                      onClick={
                        body.id
                          ? () =>
                              showModal(
                                handleSubmit,
                                undefined,
                                'Save changes',
                                'Are you sure you want to save the changes?',
                              )
                          : handleSubmit
                      }
                      color={body.id ? 'warning' : 'success'}
                      key="save-btn"
                    >
                      {body.id ? 'Update' : 'Save'}
                    </CButton>
                    {body.id && (
                      <CButton
                        color="danger"
                        onClick={() =>
                          showModal(
                            handleDelete,
                            undefined,
                            'Confirm Delete',
                            'Are you sure you want to delete this item?',
                          )
                        }
                      >
                        Delete
                      </CButton>
                    )}
                  </div>
                </div>
                <div className="row">
                  <hr />
                  <div className="mb-3 col-lg-3">
                    <CFormLabel htmlFor="firstNameQuery">First Name</CFormLabel>
                    <CFormInput
                      aria-label="First name"
                      disabled={!body.department}
                      onChange={(e) => {
                        e.preventDefault()
                        return setSearchQuery({
                          ...searchQuery,
                          firstName: e.target.value,
                        })
                      }}
                      value={searchQuery.firstName}
                    />
                  </div>
                  <div className="mb-3 col-lg-3">
                    <CFormLabel htmlFor="lastNameQuery">Last Name</CFormLabel>
                    <CFormInput
                      aria-label="Last Name"
                      disabled={!body.department}
                      onChange={(e) => {
                        e.preventDefault()
                        return setSearchQuery({
                          ...searchQuery,
                          lastName: e.target.value,
                        })
                      }}
                      value={searchQuery.lastName}
                    />
                  </div>
                  <div className="mb-3 col-lg-3">
                    <CFormLabel htmlFor="mobileNo">Mobile No</CFormLabel>
                    <CFormInput
                      aria-label="mobileNo"
                      disabled={!body.department}
                      onChange={(e) => {
                        e.preventDefault()
                        return setSearchQuery({
                          ...searchQuery,
                          mobileNo: e.target.value,
                        })
                      }}
                      value={searchQuery.mobileNo}
                    />
                  </div>
                  <div className="mb-3 col-lg-2">
                    <CFormLabel htmlFor="dateQuery">Reg/Renew Date</CFormLabel>
                    <CFormInput
                      onChange={(e) => {
                        return setSearchQuery({
                          ...searchQuery,
                          regDate: e.target.value,
                        })
                      }}
                      type="date"
                      value={getDateStr(new Date())}
                    />
                  </div>
                  <div className="col-lg-12">
                    {data ? (
                      <DataTable
                        columns={columns}
                        data={data}
                        highlightOnHover
                        pointerOnHover
                        fixedHeader
                        title="Patients"
                        pagination
                        paginationServer
                        onChangeRowsPerPage={handlePerRowsChange}
                        onChangePage={handlePageChange}
                        paginationTotalRows={totalRows}
                        onRowClicked={handleRowClicked}
                      />
                    ) : (
                      'Start a query'
                    )}
                  </div>
                </div>
              </CForm>
            </HealthSphere>
          </CCardBody>
        </CCard>
      </CCol>
      <CModal
        visible={confirmModalData.visible}
        onClose={() => closeModal()}
        aria-labelledby="LiveDemoExampleLabel"
      >
        <CModalHeader onClose={() => closeModal()}>
          <CModalTitle id="LiveDemoExampleLabel">{confirmModalData.modalTitle}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>{confirmModalData.modalBody}</p>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => closeModal()}>
            Cancel
          </CButton>
          <CButton onClick={confirmModalData.yesCallback} color="primary">
            Yes
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default PatientRegistration
