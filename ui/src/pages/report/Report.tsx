import React, { useState } from "react";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import Button from "@material-ui/core/Button";
import Ledger from "@daml/ledger";
import { useLedger, useParty, useStreamQueries} from "@daml/react";
import { ContractId } from "@daml/types";
import { InputDialog, InputDialogProps } from "./InputDialog";
import useStyles from "./styles";
import { Grants } from "@daml.js/daml-grants-0.0.1";
import { GrantingAgency, GrantOpportunity, CreateGrant, FundGrant } from "@daml.js/daml-grants-0.0.1/lib/Grants"
import { GrantFunder, GrantFunderAccessRequest, TechnicalReviewer, TechnicalReviewerAcccessRequest, GrantingApplicantAccessRequest } from "@daml.js/daml-grants-0.0.1/lib/Administrator"
import { Applicant, GranteeApplication } from "@daml.js/daml-grants-0.0.1/lib/ApplicantInfo"
import { Asset, Give, Appraise } from "@daml.js/daml-grants-0.0.1/lib/Main"



export default function Report() {
  const classes = useStyles();
  const party = useParty();
  const ledger : Ledger = useLedger();
  const assets = useStreamQueries(Asset);
  const grantopp = useStreamQueries(GrantOpportunity);

// The Give is a choice
  const defaultGiveProps : InputDialogProps<Give> = {
    open: false,
    title: "Give Asset",
    defaultValue: { newOwner : "" },
    fields: {
      newOwner : {
        label: "New Owner",
        type: "selection",
        items: [ "DeloitteAgency" , "DeloitteFunder", "DeloitteAdmin", "DeloitteApplicant1", "DeloitteApplicant2" ,"DeloitteApplicant3", "deloitteTechnicalReviewer" ] } },
    onClose: async function() {}
  };

  const [ giveProps, setGiveProps ] = useState(defaultGiveProps);
  // One can pass the original contracts CreateEvent
  function showGive(asset : Asset.CreateEvent) {
    //Give is a choice
    async function onClose(state : Give | null) {
      setGiveProps({ ...defaultGiveProps, open: false});
      // if you want to use the contracts payload
      if (!state || asset.payload.owner === state.newOwner) return;
      await ledger.exercise(Asset.Give, asset.contractId, { newOwner: (state.newOwner) } );
    };
    setGiveProps({ ...defaultGiveProps, open: true, onClose})
  };
//Appraise is choice
  type UserSpecifiedAppraise = Pick<Appraise, "newValue">;
  const today = (new Date()).toISOString().slice(0,10);
  const defaultAppraiseProps : InputDialogProps<UserSpecifiedAppraise> = {
    open: false,
    title: "Appraise Asset",
    defaultValue: { newValue: "0" },
    fields: {
      newValue : {
        label: "New Value",
        type: "number" }
      },
    onClose: async function() {}
  };
  const [ appraiseProps, setAppraiseProps ] = useState(defaultAppraiseProps);

  // Or can pass just the ContractId of an
  function showAppraise(assetContractId : ContractId<Asset>) {
    async function onClose(state : UserSpecifiedAppraise | null) {
      setAppraiseProps({ ...defaultAppraiseProps, open: false});
      if (!state) return;
      const withNewDateOfAppraisal = { ...state, newDateOfAppraisal:today};
      await ledger.exercise(Asset.Appraise, assetContractId, withNewDateOfAppraisal);
    };
    setAppraiseProps({...defaultAppraiseProps, open: true, onClose});
  };

  type InputFieldsForNewAsset = Omit<Asset, "issuer">;
  const defaultNewAssetProps : InputDialogProps<InputFieldsForNewAsset> = {
    open: false,
    title: "New Asset",
    defaultValue: {
      owner: party,
      name: "",
      dateOfAppraisal: today,
      value: "0",
    },
    fields: {
      owner: {
        label: "Owner",
        type: "selection",
        items: [ "DeloitteFunder", "DeloitteAgency" ],
      },
      name: {
        label: "Name of Asset",
        type: "text"
      },
      dateOfAppraisal: {
        label: "Date of Appraisal",
        type: "date"
      },
      value: {
        label: "Value",
        type: "number"
      }
    },
    onClose: async function() {}
  };
  const [newAssetProps, setNewAssetProps] = useState(defaultNewAssetProps);
  function showNewAsset() {
    async function onClose(state : InputFieldsForNewAsset | null) {
      setNewAssetProps({ ...defaultNewAssetProps, open: false});
      if (!state) return;
      const withIssuer = { ...state, issuer: party, owner: (state.owner) };
      await ledger.create(Asset, withIssuer);
    };
    setNewAssetProps({...defaultNewAssetProps, open: true, onClose});
  };

  return (
    <>
      <InputDialog { ...giveProps } />
      <InputDialog { ...appraiseProps } />
      <InputDialog { ...newAssetProps } />
      <Button color="primary" size="small" className={classes.choiceButton} variant="contained" onClick={() => showNewAsset()}>
        Create New Asset
      </Button>
      <Table size="small">
        <TableHead>
          <TableRow className={classes.tableRow}>
            <TableCell key={0} className={classes.tableCell}>Title</TableCell>
            <TableCell key={1} className={classes.tableCell}>Granting Agency</TableCell>
            <TableCell key={2} className={classes.tableCell}>Type Of Grant</TableCell>
            <TableCell key={3} className={classes.tableCell}>Description</TableCell>
            <TableCell key={4} className={classes.tableCell}>Total Amount</TableCell>
            <TableCell key={5} className={classes.tableCell}>Status</TableCell>
            <TableCell key={6} className={classes.tableCell}>Contact</TableCell>
            <TableCell key={7} className={classes.tableCell}>Email</TableCell>
            <TableCell key={8} className={classes.tableCell}>Administrator</TableCell>
            <TableCell key={9} className={classes.tableCell}>Grant Funder</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {grantopp.contracts.map(a => (
            <TableRow key={a.contractId} className={classes.tableRow}>
              <TableCell key={0} className={classes.tableCell}>{a.payload.title}</TableCell>
              <TableCell key={1} className={classes.tableCell}>{a.payload.grantingAgency}</TableCell>
              <TableCell key={2} className={classes.tableCell}>{a.payload.typeOfGrant}</TableCell>
              <TableCell key={3} className={classes.tableCell}>{a.payload.description}</TableCell>
              <TableCell key={4} className={classes.tableCell}>{a.payload.totalAmount}</TableCell>
              <TableCell key={5} className={classes.tableCell}>{a.payload.status}</TableCell>
              <TableCell key={6} className={classes.tableCell}>{a.payload.contact}</TableCell>
              <TableCell key={7} className={classes.tableCell}>{a.payload.email}</TableCell>
              <TableCell key={8} className={classes.tableCell}>{a.payload.administrator}</TableCell>
              <TableCell key={9} className={classes.tableCell}>{a.payload.grantFunder}</TableCell>
              <TableCell key={10} className={classes.tableCellButton}>
                <Button color="primary" size="small" className={classes.choiceButton} variant="contained" disabled={a.payload.title !== party} onClick={() => showGive(a)}>Give</Button>
              </TableCell>
              <TableCell key={6} className={classes.tableCellButton}>
                <Button color="primary" size="small" className={classes.choiceButton} variant="contained" disabled={a.payload.grantingAgency !== party} onClick={() => showAppraise(a.contractId)}>Appraise</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}