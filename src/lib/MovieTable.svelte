<script>
let {name, headers, rows} = $props();

let total = $derived(rows.reduce((sum, row) => sum + (row[2] || 0), 0));
</script>

<div>
<table>
    <thead>
        <tr><th colspan="3">{name}</th></tr>
        <tr>
            {#each headers as header}
            <th>{header}</th>
            {/each}
        </tr>
    </thead>
    <tbody>
        {#each rows as row}
        <tr>
            {#each row as cell}
                <td>{cell}</td>
            {/each}
        </tr>
        {/each}
    </tbody>
    <tfoot>
        <tr>
            <td colspan="2"><strong>Total</strong></td>
            <td><strong>{total.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}</strong></td>
        </tr>
    </tfoot>
</table>
</div>

<style>
table, td, th {
    text-align: center;
    border: 1px solid black;
    padding: 0.25em 0.5em;
}
table {
    border-collapse: collapse;
    background-image: radial-gradient(rgba(255,200,0,1), rgba(255,200,0,0));
}
tfoot td {
    border-top: 2px solid black;
}
</style>