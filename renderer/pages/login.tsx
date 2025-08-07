'use client'
import { Button, FormControl, FormGroup, TextField } from "@mui/material";
import { useState } from "react";
import { Auth } from "../shared/models/Auth";
import { redirect } from "next/dist/server/api-utils";
import { useRouter } from "next/router";
export default function Login() {
    const router = useRouter();
    const [cs, setCs] = useState<string>('');
    const [csError, setCsError] = useState<boolean>(false);

    function handleCsChange(newCs: any) {
        setCsError(false)
        if (newCs.target.value) {
            setCs(newCs.target.value)
        };
    }
    function handleEQSLNavigate() {
        router.push('/EQSLUpload');
    }
    function handleAddNewLog() {
        const log = new Auth(
            {
            callSign: cs,
        })
        console.log(log);
        const isValid: boolean = log.isValidCallsign();
        setCsError(!isValid);
        if (isValid) {
            localStorage.setItem('CCS', log.callSign);
            console.log(log.isValidCallsign());
            router.push('/home');
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
                        
                        <div className="flex flex-row mt-5">
                            <FormControl className="!mb-5 !mr-5 !w-[120px]">
                                <TextField size="small" error={csError} id="cs-input" helperText={csError? 'Incorrect CallSign': null} label="Callsign" value={cs} variant="standard" onChange={handleCsChange}/>
                            </FormControl>
                        </div>
                        <Button variant="contained" onClick={handleAddNewLog}>Enter log</Button>
                    </FormGroup>
                    <Button color="warning" size="small" variant="contained" className="!mt-10 !ml-6" onClick={handleEQSLNavigate}>Upload log to eQSL</Button>
                </div>
            </div>
        </div>
    </div>
  );
}