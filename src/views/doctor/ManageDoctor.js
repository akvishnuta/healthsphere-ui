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

const ManageDoctor = () => {
  const BASE_URL = 'http://localhost:8443'

  const [data, setData] = useState(null)
  const [confirmModalData, setConfirmModalData] = useState({ visible: false })
  const [body, setBody] = useState({ department: 'EMERGENCY' })
  const [saveResponse, setSaveResponse] = useState(null)
  const [status, setStatus] = useState({})
  const [searchQuery, setSearchQuery] = useState({ department: 'EMERGENCY' })
  const [loading, setLoading] = useState(false)
  const [totalRows, setTotalRows] = useState(0)
  const [departmentList, setDepartmentList] = useState([])

  useMemo(() => {
    setLoading(true)

    fetch(BASE_URL + '/v1/department/list')
      .then((response) => response.json())
      .then((json) => {
        setDepartmentList([...json.data])
      })
      .catch((error) => console.error(error))

    const queryStr = objToQueryString(searchQuery)
    fetch(BASE_URL + '/v1/doctor/search?' + queryStr)
      .then((response) => response.json())
      .then((json) => {
        setData([...json.data.list])
        setTotalRows(json.data.totalRecords)
      })
      .catch((error) => console.error(error))
    setLoading(false)
  }, [saveResponse, searchQuery])

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
    await fetch(BASE_URL + '/v1/doctor', {
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
    await fetch(BASE_URL + '/v1/doctor/' + body.id, {
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

  const handleRowClicked = (row, e) => {
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
      name: 'Department',
      selector: (row) => row.department,
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
            <strong>Add New Doctor</strong>
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
                  <div className="mb-3 col-lg-6">
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
                  <div className="mb-3 col-lg-6">
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
                </div>
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
                </div>

                <div className="row">
                  <div className="mb-3 col-lg-6">
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
                  <div className="mb-3 col-lg-6">
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
                  <div className="mb-3 col-lg-6"></div>
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
                  <div className="mb-3 col-lg-6">
                    <CFormLabel htmlFor="departmentQuery">Department Query</CFormLabel>
                    <CFormSelect
                      aria-label="Default select example"
                      options={['Select Department', ...departmentList]}
                      onChange={(e) => {
                        e.preventDefault()
                        return setSearchQuery({
                          ...searchQuery,
                          department: e.target.value,
                        })
                      }}
                      value={searchQuery.department}
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
                        title="Doctors"
                        pagination
                        paginationServer
                        onChangeRowsPerPage={handlePerRowsChange}
                        onChangePage={handlePageChange}
                        paginationTotalRows={totalRows}
                        onRowClicked={handleRowClicked}
                      />
                    ) : (
                      'Loading...'
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

export default ManageDoctor
