import React, { useState } from 'react';
import { Button, ConfigProvider, AutoComplete, Table } from 'antd';
import './App.css';

function getCourseAverage(dept, id) {
	dept = dept.toLowerCase();
	let query = {
		WHERE: {
			AND: [
				{IS: {pair_dept: dept}},
				{IS: {pair_id: id}}
			]
		},
		OPTIONS: {
			COLUMNS: [
				"pair_id",
				"pair_year",
				"overallAVG"
			],
			ORDER: {
				dir: "DOWN",
				keys: ["pair_year"]
			}
		},
		TRANSFORMATIONS: {
			GROUP: [
				"pair_id",
				"pair_year"
			],
			APPLY: [{overallAVG: {AVG: "pair_avg"}}
			]
		}
	};

	return  fetch('http://localhost:4321/query', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(query)
	});
}

function getRoomAddress(name) {
	const sname = name.toUpperCase();
	let query  = {
		WHERE: {
			OR: [
				{IS: {campus_shortname: sname}},
				{IS: {campus_fullname: name}}
			]
		},
		OPTIONS: {
			COLUMNS: [
				"campus_address"
			]
		},
		TRANSFORMATIONS: {
			GROUP: [
				"campus_address"
			],
			APPLY:[]
		}
	};
	return fetch('http://localhost:4321/query', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(query)
	});
}

function App() {
	const [showCourses, setShowCourses] = useState(false);
	const [showBuildings, setShowBuildings] = useState(false);

	const [dept, setDept] = useState('');
	const [id, setId] = useState('');
	const [building, setBuilding] = useState('');
	const [results, setResults] = useState([]);
	const [displayedTitle, setDisplayedTitle] = useState('');

	const handleDeptChange = (value) => {
		setDept(value);
	};

	const handleIdChange = (value) => {
		setId(value);
	};

	const handleBuildingChange = (value) => {
		setBuilding(value);
	};

	const handleShowCourses = () => {
		setShowCourses(true);
		setShowBuildings(false);
	};

	const handleHideCourses = () => {
		setShowCourses(false);
		setResults([]);
		setDisplayedTitle('');
	};

	const handleShowBuildings = () => {
		setShowBuildings(true);
		setShowCourses(false);
	};

	const handleHideBuildings = () => {
		setShowBuildings(false);
		setResults([]);
		setDisplayedTitle('');
	};

	const handleCourseEnter = () => {
		getCourseAverage(dept, id)
			.then((response) => response.json())
			.then((data) => {
				setResults(data.result);
				setDisplayedTitle(`${dept.toUpperCase()} ${id}`);
				return data.result;
			}).then((result) => {
			if (result.length === 0) {
				alert("No results for \"" + `${dept.toUpperCase()} ${id}` + "\"");
			}
		});
	};

	const handleBuildingEnter = () => {
		getRoomAddress(building)
			.then((response) => response.json())
			.then((data) => {
				setResults(data.result);
				return data.result;
			}).then((result) => {
			if (result.length === 0) {
				alert("No results for \"" + `${building}` + "\"");
			} else {
				setDisplayedTitle(`${result[0].campus_address}`);
			}
		});
	};

	const courseColumns = [
		{
			title: "Year",
			dataIndex: "pair_year",
			key: "pair_year",
			width: 350
		},
		{
			title: "Overall Average",
			dataIndex: "overallAVG",
			key: "overallAVG",
			width: 350
		},
	];

	return (
		<div className="App">
			<ConfigProvider
				theme={{
					token: {
						colorPrimary: '#22b922',
					},
				}}
			>
			<div className="header">
				<h1>UBC Insight</h1>
			</div>
			{showCourses ? (
				<>
					<div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
						<div style={{display: 'flex', flexDirection: 'column'}}>
							<div style={{ display: 'flex', alignItems: 'center'}}>
								<p style={{ marginRight: 10, width: 80, textAlign: 'right'}}>Dept:</p>
								<AutoComplete placeholder="Enter dept"
											  onChange={handleDeptChange}
											  style={{width: 400}}/>
							</div>
							<div style={{display: 'flex', alignItems: 'center', marginTop: -10}}>
								<p style={{marginRight: 10, width: 80, textAlign: 'right'}}>Course #:</p>
								<AutoComplete placeholder="Enter #"
											  onChange={handleIdChange}
											  style={{width: 400}}/>
							</div>
						</div>
				<Button type="primary"
						onClick={handleCourseEnter}
						style={{fontWeight: 'bold', marginLeft: 10, alignSelf: 'center'}}>
					Enter
				</Button>
					</div>
					{results.length > 0 && (
						<div style={{maxWidth: 800, margin: "auto"}}>
							<h3>{displayedTitle}</h3>
							<br/>
							<Table columns={courseColumns} dataSource={results} rowKey="pair_id"
								   style={{marginLeft: 'auto', marginRight: 'auto'}} />
						</div>
					)}
					<br/>
					<Button type="primary" danger onClick={handleHideCourses} style={{fontWeight: 'bold', marginTop: 10}}>
						Cancel
					</Button>
				</>
			) : showBuildings ? (
				<>
					<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
						<p style={{ marginRight: 10, width: 80, textAlign: 'right' }}>Building</p>
						<AutoComplete placeholder="Enter building name (FULL NAMES ARE CASE SENSITIVE)"
									  onChange={handleBuildingChange}
									  style={{width: 400}} />
						<Button type="primary"
								onClick={handleBuildingEnter}
								style={{fontWeight: 'bold', marginLeft: 10, alignSelf: 'center'}}>
							Enter
						</Button>
					</div>
					{results.length > 0 && (
						<div style={{maxWidth: 800, margin: "auto"}}>
							<h3>Address: {displayedTitle}</h3>
						</div>
					)}
					<br/>
					<Button	type="primary" danger onClick={handleHideBuildings} style={{ fontWeight: 'bold', marginTop: 10}}>
						Cancel
					</Button>
				</>
			): (
				<div style={{ marginTop: 10}}>
					<Button type="primary"	onClick={handleShowCourses}
						style={{ fontWeight: 'bold', marginRight: 10}}>
						Courses
					</Button>
					<Button type="primary" onClick={handleShowBuildings}
							style={{fontWeight: 'bold'}}>
						Buildings
					</Button>
				</div>
			)}
			</ConfigProvider>
		</div>
	);
}

export default App;
