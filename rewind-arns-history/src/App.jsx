// Perbaiki fungsi handleSearch
const handleSearch = async () => {
  try {
    setIsLoading(true);
    setError(null);
    
    // Validasi input
    if (!contractId.trim()) {
      setError('Please enter a contract ID');
      return;
    }

    const response = await axios.get(
      `https://api.arns.app/v1/contract/${contractId}/history`
    );

    if (response.data && response.data.history) {
      // Filter berdasarkan input pengguna jika ada
      let filteredResults = response.data.history;
      
      if (searchTerm.trim()) {
        const searchTermLower = searchTerm.toLowerCase();
        filteredResults = filteredResults.filter(item => 
          (item.function && item.function.toLowerCase().includes(searchTermLower)) ||
          (item.input && JSON.stringify(item.input).toLowerCase().includes(searchTermLower)) ||
          (item.txId && item.txId.toLowerCase().includes(searchTermLower))
        );
      }

      setSearchResults(filteredResults);
    } else {
      setSearchResults([]);
      setError('No history found for this contract');
    }
  } catch (err) {
    console.error('Error fetching data:', err);
    setError('Failed to fetch data. Please check the contract ID and try again.');
    setSearchResults([]);
  } finally {
    setIsLoading(false);
  }
};