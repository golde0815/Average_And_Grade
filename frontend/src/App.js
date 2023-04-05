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

function App() {
	const [showCourses, setShowCourses] = useState(false);
	const [showBuildings, setShowBuildings] = useState(false);
	const handleShowCourses = () => {
		setShowCourses(true);
		setShowBuildings(false);
	};

	const [dept, setDept] = useState('');
	const [id, setId] = useState('');
	const [results, setResults] = useState([]);
	const [displayedTitle, setDisplayedTitle] = useState('');

	const handleDeptChange = (value) => {
		setDept(value);
	};

	const handleIdChange = (value) => {
		setId(value);
	};

	const handleHideCourses = () => {
		setShowCourses(false);
	};

	const handleShowBuildings = () => {
		setShowBuildings(true);
		setShowCourses(false);
	};

	const handleHideBuildings = () => {
		setShowBuildings(false);
	};

	const handleCourseEnter = () => {
		getCourseAverage(dept, id)
			.then((response) => response.json())
			.then((data) => {
				setResults(data.result);
				setDisplayedTitle(`${dept.toUpperCase()} ${id}`);
				if (results.length === 0) {
					alert("No results for " + displayedTitle);
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
								<AutoComplete placeholder="Enter dept" style={{ width: 400 }} onChange={handleDeptChange}/>
							</div>
							<div style={{display: 'flex', alignItems: 'center', marginTop: -10}}>
								<p style={{marginRight: 10, width: 80, textAlign: 'right'}}>Course #:</p>
								<AutoComplete placeholder="Enter #" style={{width: 400}} onChange={handleIdChange}/>
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
						<AutoComplete placeholder="Enter building" style={{ width: 400 }} />
						<Button type="primary" style={{fontWeight: 'bold', marginLeft: 10, alignSelf: 'center'}}>
							Enter
						</Button>
					</div>
					<Button
						type="primary"
						danger
						onClick={handleHideBuildings}
						style={{ fontWeight: 'bold', marginTop: 10}}
					>
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
							style={{ fontWeight: 'bold'}}>
						Buildings
					</Button>
				</div>
			)}
			</ConfigProvider>
		</div>
	);
}

export default App;
