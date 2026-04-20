<script>
let {name, headers, rows} = $props();

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
</style>