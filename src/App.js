import React, { Component } from 'react';
// import logo from './logo.svg';
// import './App.css';
import { Form, Input, Button, Container, Row, Col } from 'muicss/react';
import ReactTable from 'react-table'
import "react-table/react-table.css";

import { getPatient, getConditions, extractPatientDemographics, extractPatientConditions } from './api-utils';


const stateReset = {patientLoaded: false, name: '', gender: '', birthDate: '', concditionsLoaded: false, patientConditions: [], loading: false};

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      ...stateReset,
      errorMsg: '',
      patientId: '4596007',
      errMsg: ''
    }
  }


  lookupPatient = () => {
    this.setState({loading: true, errMsg: ''})

    getPatient(this.state.patientId).then(patientData => {
      // console.log(patientData)
      const extracted = extractPatientDemographics(patientData);
      this.setState({...extracted, patientLoaded: true});
      
      return getConditions(this.state.patientId);
    })
    .then(result => {
      // console.log(result)
      this.setState({conditionsLoaded: true, patientConditions: extractPatientConditions(result)});
    })
    .catch(e => {
      this.setState(stateReset);
      if (e && e.status === 404) {
        this.setState({errMsg: 'Record not found'})
      } else {
        this.setState({errMsg: 'There was a problem processing your request'})
      }
    })
  }

  handleChange = e => {
    this.setState({patientId: e.target.value});
  }


  handleSubmit = e => {
    e.preventDefault();
    this.lookupPatient();
  }

  render() {

    const columns = [{Header: "Name", accessor: "name"}, 
      {Header: "First recorded", accessor: "dateRecorded"}, 
      {Header: "See also", id: "pubMedLookup", accessor: s => (<a href={`https://www.ncbi.nlm.nih.gov/pubmed/?term=${s.encodedSearchString}`} target="_blank">PubMed lookup</a>)}
    ]


    return (
      <div>
      <Container style={{backgroundColor: '#444'}}><div className="mui--text-title mui--text-light mui--text-center" style={{padding: "15px 15px", minWidth: "200px"}}>SMART on FHIR UI Coding Exercise</div></Container>
      <main>
      <Container style={{margin: "20px"}}>
      <Form style={{width: "60%"}} onSubmit={this.handleSubmit}>
        <legend>Search for patient by ID</legend>
        <Input placeholder="Patient ID" value={this.state.patientId} onChange={this.handleChange} />
        <Button variant="raised" >Submit</Button>
      </Form>
      {this.state.errMsg && (<div className="mui--text-body2 mui--text-accent">{this.state.errMsg}</div>)}
      {this.state.patientLoaded && (
      <Container fluid={true} style={{padding: "20px 20px"}}>
      <h2>Patient data</h2>

              <Row><Col md="3"  >Patient name</Col><Col md="3"  >{this.state.name}</Col></Row>
              <Row><Col md="3"  >Gender</Col><Col md="3"  >{this.state.gender}</Col></Row>
              <Row><Col md="3">Date of birth</Col><Col md="3">{this.state.birthDate}</Col></Row>
              </Container>
             )}
             {this.state.patientLoaded && this.state.conditionsLoaded && (
 <Container>
 <h2>Conditions</h2>
    
      <ReactTable data={this.state.patientConditions} columns={columns} />
</Container>
             )}
        </Container>
        </main>
        </div>

        );
  }
}

export default App;