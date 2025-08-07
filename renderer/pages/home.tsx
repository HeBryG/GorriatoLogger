'use client'
import { Button, FormControl, FormGroup, InputLabel, MenuItem, Paper, Select, SelectChangeEvent, SelectProps, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@mui/material";
import { Bands } from "../shared/enum/Bands";
import { useEffect, useState } from "react";
import { Modes } from "../shared/enum/Modes";
import { Log } from "../shared/models/Log";
import { cookies } from "next/headers";
import { useRouter } from "next/router";
import { callsignPrefixesData } from '../shared/csPrefixes'; // Adjust path as needed
import { countryToIsoCodeMap } from '../shared/countries'; // Adjust path as needed
import { FlagIcon } from "react-flag-kit";

export default function Home() {

    const router = useRouter();
    const [logs, setLogs] = useState<any[]>([]);
    const [rows, setRows] = useState<any[]>([]);
    const [cs, setCs] = useState<string>('');
    const [destCallSign, setDestCallSign] = useState<string>('');
    const [csError, setCsError] = useState<boolean>(false);
    const [band, setBand] = useState<Bands>(Bands.Band20m);
    const [mode, setMode] = useState<Modes>(Modes.CW);
    const [notes, setNotes] = useState<string | null>(null)
    const paginationModel = { page: 0, pageSize: 5 };

    let rowsOld = [];
    function createData(
        id: number,
        callSign: string,
        country: string,
        countryIso: string,
        band: string,
        mode: string,
    ) {
    return { id, callSign, country, countryIso, band, mode };
    }
    const fetchLogs = async (callsign?: string) => {
        
        if (window.api) {
        try {
            let fetchedLogs: {
                id: number;
                callsign: string;
                destCallSign: string;
                band: string;
                frequencyMHz: number;
                mode: string;
                sentReport: number;
                receivedReport: number;
                notes: string;
            }[]
            if (callsign) {
                fetchedLogs = await window.api.getLogs(callsign);
                console.log('---------------FETCH LSCS' + callsign)
            } else {
                console.log('---------------FETCH CS' + cs)
                fetchedLogs = await window.api.getLogs(cs);
            }
            setLogs(fetchedLogs);
            let entries = []
            fetchedLogs.forEach((lg) => {
                const normalizedCallsign = lg.destCallSign.toUpperCase();
                let country = '';
                let isoCode = '';
                // 2. Iterate and Match: Iterate through the pre-sorted prefixes (longest first).
                for (const entry of callsignPrefixesData) {
                    if (normalizedCallsign.startsWith(entry.prefix)) {
                    // 3. Determine Match: Return the country for the first (longest) matching prefix.
                        country = entry.country;
                        console.log(country)
                        isoCode = countryToIsoCodeMap[country] || ''; // Get ISO code, default to empty string if not found
                    }
                }
                entries.push(createData(lg.id, lg.destCallSign, country, isoCode, lg.band, lg.mode))
            })
            setRows(entries);
            console.log(fetchedLogs);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
        }
    };
    useEffect(() => {
        const lscs = localStorage.getItem('CCS');
        if (!lscs) {
            console.log('------------NOT LOGGED IN------------------')
            goBack();
        } else {
            setCs(lscs);
            const fetchData = async (lscs) => {
                await fetchLogs(lscs);
            };
            fetchData(lscs);
        }
    }, []);

    function goBack() {
        localStorage.removeItem('CCS');
        router.push('/login');
    }
    function handleCsChange(newCs) {
        setCsError(false)
        if (newCs.target.value) {
            setDestCallSign(newCs.target.value)
        };
    }
    function handleBandChange(band: SelectChangeEvent) {
        console.log(band)
        if (band.target.value) setBand(band.target.value as Bands)
    }
    function handleModeChange(mode: SelectChangeEvent) {
        console.log(mode)
        if (mode.target.value) setMode(mode.target.value as Modes)
    }
    async function handleAddNewLog() {
        console.log("-----------------------CS:" + cs);
        console.log("-----------------------destCS: " + destCallSign)
        const entry = {
            callSign: cs,
            timestamp: '',
            destCallSign: destCallSign,
            band,
            mode,
            notes: notes? notes: undefined,
        };
        let log: Log = new Log(entry)
        console.log(log);
        const isValid: boolean = log.isValidDestCallsign();
        setCsError(!isValid);
        if (isValid) {
            try {
                const res = await window.api.addLog(log.callSign, log.destCallSign, band, 0, mode, '', '', notes);
                console.log('-----------------------Log added: ' + res.toString())
                setDestCallSign('');
                await fetchLogs();
            } catch(e) {
                console.log('problem adding log')
            }
        } else {
            setCsError(!isValid);
            setDestCallSign('');
        }
    }
    return (
    <div className="flex flex-col h-full">
        <div className="h-14 flex flex-row bg-blue-800">
            <h1 className="text-white text-2xl my-auto ml-4 font-bold">EA4IIF Logger</h1>
        </div>
        <div className="flex flex-col bg-gray-600 h-full">
            <div className="mx-auto p-6 w-auto flex flex-col h-auto bg-white shadow rounded-2xl mt-5">
                <div className="mx-auto">
                    <h1 className="font-bold mx-auto text-gray-700">Log entry</h1>
                </div>
                <div className="flex flex-col">
                    <FormGroup>
                        <Button variant="contained" color="warning" className="!w-32" onClick={goBack}>Go back</Button>
                        <div className="flex flex-row mt-5">
                            <FormControl className="!mb-5 !mr-5 !w-[120px]">
                                <TextField size="small" error={csError} id="cs-input" helperText={csError? 'Incorrect CallSign': null} label="Callsign" value={destCallSign} variant="standard" onChange={handleCsChange}/>
                            </FormControl>
                            <FormControl className="!mb-5 !mx-5">
                                <InputLabel id="mode-select">Mode: </InputLabel>
                                <Select
                                    labelId="mode-select"
                                    value={mode}
                                    label="Mode"
                                    onChange={handleModeChange}
                                >   
                                    {Object.values(Modes).map((mode, i) => {
                                        return <MenuItem key={i} value={mode}>{mode}</MenuItem>
                                    })}
                                    
                                </Select>
                            </FormControl>
                            <FormControl className="!mb-5 !mx-5">
                                <InputLabel id="band-select">Band: </InputLabel>
                                <Select
                                    labelId="band-select"
                                    value={band}
                                    label="Band"
                                    onChange={handleBandChange}
                                >   
                                    {Object.values(Bands).map((band, i) => {
                                        return <MenuItem key={i} value={band}>{band}</MenuItem>
                                    })}
                                    
                                </Select>
                            </FormControl>
                        </div>
                        <TextField
                            className="!mb-5"
                            id="notes-multiline-flexible"
                            label="Notes"
                            multiline
                            maxRows={4}
                            variant="standard"
                            onChange={(e) => setNotes(e.target.value)}
                        />
                        <Button variant="contained" onClick={handleAddNewLog}>Submit</Button>
                    </FormGroup>
                </div>
            </div>
            <div className="mx-auto p-6 pb-8 w-auto flex flex-col h-1/3 overflow-hidden bg-white shadow rounded-2xl mt-5">
                <div className="mx-auto">
                    <h1 className="font-bold mx-auto text-gray-700">Logbook</h1>
                </div>
                <div className="flex flex-col h-full">
                        <TableContainer component={Paper}>
                            <Table sx={{ minWidth: 350 }} aria-label="simple table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>CallSign</TableCell>
                                        <TableCell align="right">Band</TableCell>
                                        <TableCell align="right">Mode</TableCell>
                                        <TableCell align="right">ID</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                {
                                    rows.map((row) => (
                                        <TableRow
                                        key={row.id}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                        >
                                        <TableCell component="th" scope="row">
                                            {row.callSign} ({row.countryIso ? (
                                                <FlagIcon code={row.countryIso} alt={row.country} className="inline" size={12} /> // Display the flag
                                            ) : (
                                                <span style={{ fontSize: '24px' }}>{row.country}</span> // Placeholder if no flag found
                                            )})
                                        </TableCell>
                                        <TableCell align="right">{row.band}</TableCell>
                                        <TableCell align="right">{row.mode}</TableCell>
                                        <TableCell align="right">{row.id}</TableCell>
                                        </TableRow>
                                    ))
                                }
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
            </div>
        </div>
    </div>
  );
}
