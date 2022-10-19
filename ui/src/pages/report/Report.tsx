import React, { useState } from "react";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import Button from "@material-ui/core/Button";
import Ledger from "@daml/ledger";
import { useStreamQueries, useLedger, useParty } from "@daml/react";
import { ContractId } from "@daml/types";
import { GrantOpportunity } from "@daml.js/daml-grants-0.0.1/lib/Grants"
//import { test_GrantingProcess  } from "@daml.js/daml-grants-0.0.1/lib/TestCases"
import { Appraise, Asset, Give  } from "@daml.js/daml-grants-0.0.1/lib/Main";
import { InputDialog, InputDialogProps } from "./InputDialog";
import useStyles from "./styles";
import { getParty } from "../../config";


export default function Report() {
  const classes = useStyles();
  const party = useParty();
  const ledger : Ledger = useLedger();
//  const assets = useStreamQueries(Asset);
  const grantopp = useStreamQueries(GrantOpportunity);

  const defaultGiveProps : InputDialogProps<Give> = {
    open: false,
    title: "Give Asset",
    defaultValue: { newOwner : "" },
    fields: {
      newOwner : {
        label: "New Owner",
        type: "selection",
        items: [ "DeloiiteAdmin", "DeloitteFunder" ] } },
    onClose: async function() {}
  };

  const [ giveProps, setGiveProps ] = useState(defaultGiveProps);
  // One can pass the original contracts CreateEvent
  function showGive(asset : Asset.CreateEvent) {
    async function onClose(state : Give | null) {
      setGiveProps({ ...defaultGiveProps, open: false});
      // if you want to use the contracts payload
      if (!state || asset.payload.owner === state.newOwner) return;
      await ledger.exercise(Asset.Give, asset.contractId, { newOwner: getParty(state.newOwner) } );
    };
    setGiveProps({ ...defaultGiveProps, open: true, onClose})
  };

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

  type InputFieldsForNewAsset = Omit<GrantOpportunity, "issuer">;
  const defaultNewAssetProps : InputDialogProps<InputFieldsForNewAsset> = {
    open: false,
    title: "New Grant Opportunity",
    defaultValue: {
      grantingAgency: party,
      typeOfGrant: "",
      description: "",
      totalAmount: "0",
      title: "",
      status: "",
      contact: "",
      email: "",
      administrator: party,
      grantFunder: party
    },
    fields: {
      grantingAgency: {
        label: "Granting Agency",
        type: "selection",
        items: [ "DeloitteAgency", "DeloitteFunder" ],
      },
      typeOfGrant: {
        label: "Type of Grant",
        type: "text"
      },
      description: {
        label: "Description",
        type: "text"
      },
      totalAmount: {
        label: "Value",
        type: "number"
      },
      title: {
        label: "Title",
        type: "text",
      },
      status: {
        label: "Status",
        type: "text",
      },
      contact: {
        label: "Phone",
        type: "text",
      },
      email: {
        label: "Email",
        type: "text",
      },
      administrator: {
        label: "Administrator",
        type: "selection",
        items: [ "DeloitteAgency", "DeloitteFunder" ],
      },
      grantFunder: {
        label: "Grant Funder",
        type: "selection",
        items: [ "DeloitteAgency", "DeloitteFunder" ],
      }
    },
    onClose: async function() {}
  };
  const [newAssetProps, setNewAssetProps] = useState(defaultNewAssetProps);
  function showNewAsset() {
    async function onClose(state : InputFieldsForNewAsset | null) {
      setNewAssetProps({ ...defaultNewAssetProps, open: false});
      if (!state) return;
      const withIssuer = { ...state, issuer: party, owner: getParty(state.grantingAgency) };
      await ledger.create(GrantOpportunity, withIssuer);
    };
    setNewAssetProps({...defaultNewAssetProps, open: true, onClose});
  };

  return (
    <>
      <InputDialog { ...giveProps } />
      <InputDialog { ...appraiseProps } />
      <InputDialog { ...newAssetProps } />
      <Button color="primary" size="small" className={classes.choiceButton} variant="contained" onClick={() => showNewAsset()}>
        Create New Grant Opportunity
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
